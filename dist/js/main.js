let subnetMap = {};
let maxNetSize = 0;
const infoColumnCount = 5;
// NORMAL mode:
//   - Smallest subnet: /32
//   - Two reserved addresses per subnet of size <= 30:
//     - Net+0 = Network Address
//     - Last = Broadcast Address
// AWS mode:
//   - Smallest subnet: /28
//   - Two reserved addresses per subnet:
//     - Net+0 = Network Address
//     - Net+1 = AWS Reserved - VPC Router
//     - Net+2 = AWS Reserved - VPC DNS
//     - Net+3 = AWS Reserved - Future Use
//     - Last = Broadcast Address
// Azure mode:
//   - Smallest subnet: /29
//   - Two reserved addresses per subnet:
//     - Net+0 = Network Address
//     - Net+1 = Reserved - Default Gateway
//     - Net+2 = Reserved - DNS Mapping
//     - Net+3 = Reserved - DNS Mapping
//     - Last = Broadcast Address
// GCP mode:
//   - Smallest subnet: /29
//   - Four reserved addresses per subnet:
//     - Net+0 = Network Address
//     - Net+1 = GCP Reserved - Default Gateway
//     - Last-1 = GCP Reserved - Future Use
//     - Last = Broadcast Address
// OCI mode:
//   - Smallest subnet: /30
//   - Three reserved addresses per subnet:
//     - Net+0 = Network Address
//     - Net+1 = OCI Reserved - Default Gateway Address
//     - Last = Broadcast Address
let noteTimeout;
let operatingMode = "Standard";
let previousOperatingMode = "Standard";
let inflightColor = "NONE";
let ipVersion = "IPv4";
let showParentHeaders = false;
const urlVersion = "1";
const configVersion = "2";

const ipv6Pattern =
  "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$";
const ipv6NetsizePattern = "^([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$";

const netsizePatterns = {
  Standard: "^([12]?[0-9]|3[0-2])$",
  AZURE: "^([12]?[0-9])$",
  AWS: "^(1?[0-9]|2[0-8])$",
  GCP: "^([12]?[0-9])$",
  OCI: "^([12]?[0-9]|30)$",
};

const minSubnetSizes = {
  Standard: 32,
  AZURE: 29,
  AWS: 28,
  GCP: 29,
  OCI: 30,
};

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates a CSS hex color string to prevent CSS injection.
 * Only allows valid CSS hex color formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA.
 * Returns empty string for invalid/unsafe values.
 */
function sanitizeColor(color) {
  if (typeof color !== "string" || color === "") return "";
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    color.trim(),
  )
    ? color.trim()
    : "";
}

/**
 * 15-Minute Temporary Cookie Storage System (RFC 6265 compliant)
 * Manages transient session states such as subnet drafts and visit deduplication.
 */
const TemporaryCookieStore = {
  DEFAULT_MAX_AGE: 900, // 15 minutes = 900 seconds

  set: function (name, value, maxAgeSeconds) {
    try {
      const age =
        typeof maxAgeSeconds === "number"
          ? maxAgeSeconds
          : this.DEFAULT_MAX_AGE;
      const encodedKey = encodeURIComponent(String(name).trim());
      const encodedVal = encodeURIComponent(String(value));
      const isSecure =
        window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${encodedKey}=${encodedVal}; max-age=${age}; path=/; SameSite=Lax${isSecure}`;
    } catch (e) {
      console.warn("TemporaryCookieStore.set failed:", e);
    }
  },

  get: function (name) {
    try {
      const target = encodeURIComponent(String(name).trim()) + "=";
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf(target) === 0) {
          return decodeURIComponent(cookies[i].substring(target.length));
        }
      }
    } catch (e) {
      console.warn("TemporaryCookieStore.get failed:", e);
    }
    return null;
  },

  remove: function (name) {
    try {
      const encodedKey = encodeURIComponent(String(name).trim());
      const isSecure =
        window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${encodedKey}=; max-age=0; path=/; SameSite=Lax${isSecure}`;
    } catch (e) {
      console.warn("TemporaryCookieStore.remove failed:", e);
    }
  },
};

function parseIpv6(str) {
  if (typeof str !== "string") return 0n;
  str = str.trim().toLowerCase();
  const parts = str.split("::");
  const left = parts[0] ? parts[0].split(":").filter(Boolean) : [];
  const right = parts.length > 1 ? parts[1].split(":").filter(Boolean) : [];
  const missing = 8 - (left.length + right.length);
  const words = [...left, ...Array(missing).fill("0"), ...right];
  return words.reduce(
    (acc, w) => (acc << 16n) + BigInt(parseInt(w || "0", 16)),
    0n,
  );
}

function formatIpv6(val) {
  const words = [];
  for (let i = 7; i >= 0; i--) {
    const word = Number((val >> BigInt(i * 16)) & 0xffffn);
    words.push(word.toString(16));
  }
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (words[i] === "0") {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  if (bestLen < 2) {
    return words.join(":");
  }
  const head = words.slice(0, bestStart).join(":");
  const tail = words.slice(bestStart + bestLen).join(":");
  return head + "::" + tail;
}

function getIpv6Network(ipStr, prefix) {
  prefix = parseInt(prefix, 10);
  if (prefix === 0) return "::";
  const ipInt = parseIpv6(ipStr);
  const hostBits = 128 - prefix;
  const mask = ((1n << 128n) - 1n) ^ ((1n << BigInt(hostBits)) - 1n);
  const netInt = ipInt & mask;
  return formatIpv6(netInt);
}

function getIpv6End(netStr, prefix) {
  prefix = parseInt(prefix, 10);
  const netInt = parseIpv6(netStr);
  const hostBits = 128 - prefix;
  const endInt = netInt + (1n << BigInt(hostBits)) - 1n;
  return formatIpv6(endInt);
}

function getNextIpv6Tier(prefix) {
  prefix = parseInt(prefix, 10);
  if (prefix < 32) return 32;
  if (prefix >= 32 && prefix < 48) return Math.min(48, prefix + 4);
  if (prefix === 48) return 56;
  if (prefix > 48 && prefix < 56) return 56;
  if (prefix === 56) return 60;
  if (prefix > 56 && prefix < 60) return 60;
  if (prefix === 60) return 64;
  if (prefix >= 64 && prefix < 80) return prefix;
  if (prefix >= 80 && prefix < 96) return Math.min(96, prefix + 4);
  if (prefix >= 96 && prefix < 112) return Math.min(112, prefix + 4);
  if (prefix === 112) return 120;
  if (prefix > 112 && prefix < 120) return 120;
  if (prefix === 120) return 124;
  if (prefix > 120 && prefix < 124) return 124;
  if (prefix >= 124 && prefix < 127) return 127;
  if (prefix === 127) return 128;
  return 128;
}

function splitIpv6Network(netStr, curPrefix) {
  curPrefix = parseInt(curPrefix, 10);
  const targetPrefix = getNextIpv6Tier(curPrefix);
  if (targetPrefix <= curPrefix || targetPrefix - curPrefix > 8) return [];
  const count = 1n << BigInt(targetPrefix - curPrefix);
  const step = 1n << BigInt(128 - targetPrefix);
  const baseInt = parseIpv6(netStr);
  const subnets = [];
  for (let i = 0n; i < count; i++) {
    const subInt = baseInt + i * step;
    subnets.push(formatIpv6(subInt) + "/" + targetPrefix);
  }
  return subnets;
}

function getIpv6Capacity(netSize) {
  netSize = parseInt(netSize, 10);
  if (netSize === 128) {
    return "1 IP (Host / Loopback)";
  }
  if (netSize === 127) {
    return "2 IPs (Point-to-Point, RFC 6164)";
  }
  if (netSize === 124) {
    return "16 IPs (/124)";
  }
  if (netSize === 120) {
    return "256 IPs (/120)";
  }
  if (netSize === 112) {
    return "65.5K IPs (/112)";
  }
  if (netSize === 96) {
    return "4.29B IPs (/96)";
  }
  if (netSize === 80) {
    return "281.5T IPs (/80)";
  }
  if (netSize === 64) {
    return "18.4Q IPs (SLAAC)";
  }
  if (netSize === 60) return "16 × /64 subnets";
  if (netSize === 56) return "16 × /60 (256 × /64)";
  if (netSize === 48) return "256 × /56 (65.5K × /64)";
  if (netSize === 32) return "65.5K × /48 (4.29B × /64)";

  if (netSize < 64) {
    const subnets64 = 1n << BigInt(64 - netSize);
    if (subnets64 < 1000n) {
      return `${subnets64} × /64`;
    } else if (subnets64 < 1000000n) {
      return `${(Number(subnets64) / 1000).toFixed(1)}K × /64`;
    } else if (subnets64 < 1000000000n) {
      return `${(Number(subnets64) / 1000000).toFixed(1)}M × /64`;
    } else {
      return `${(Number(subnets64) / 1000000000).toFixed(2)}B × /64`;
    }
  } else {
    const ips = 1n << BigInt(128 - netSize);
    if (ips < 1000n) {
      return `${ips} IPs`;
    } else if (ips < 1000000n) {
      return `${(Number(ips) / 1000).toFixed(1)}K IPs`;
    } else if (ips < 1000000000n) {
      return `${(Number(ips) / 1000000).toFixed(1)}M IPs`;
    } else if (ips < 1000000000000n) {
      return `${(Number(ips) / 1000000000).toFixed(2)}B IPs`;
    } else if (ips < 1000000000000000n) {
      return `${(Number(ips) / 1000000000000).toFixed(1)}T IPs`;
    } else {
      return `${(Number(ips) / 1000000000000000).toFixed(1)}Q IPs`;
    }
  }
}

function switchIpVersion(newVersion) {
  if (ipVersion === newVersion) return;
  ipVersion = newVersion;

  if (ipVersion === "IPv6") {
    $("#btn_ipv6").addClass("active").attr("aria-pressed", "true");
    $("#btn_ipv4").removeClass("active").attr("aria-pressed", "false");
    $("#ipv6_tier_info").removeClass("d-none");
    $("#ipv4_tier_info").addClass("d-none");
    $("#network_label").text("IPv6 Prefix / Network");
    $("#netsize_label").text("Prefix Length");
    $("#network").val("2001:db8::");
    $("#network").attr("pattern", ipv6Pattern);
    $("#netsize").val("32");
    $("#netsize").attr("pattern", ipv6NetsizePattern);
    updateActiveIpv6Preset("32");

    $("#input_form").validate().resetForm();
    $("#input_form #network").rules("remove");
    $("#input_form #network").rules("add", {
      required: true,
      messages: {
        required: "Please enter an IPv6 prefix",
      },
    });
    $("#input_form #netsize").rules("remove");
    $("#input_form #netsize").rules("add", {
      required: true,
      pattern: ipv6NetsizePattern,
      messages: {
        required: "Please enter a prefix length",
        pattern: "Prefix length must be between 0 and 128",
      },
    });

    $("#calc").addClass("ipv6-mode");
    $("#subnetHeader").text("Subnet Prefix");
    $("#rangeHeader").text("Subnet Range");
    $("#useableHeader").text("Subnet / Interface ID");
    $("#hostsHeader").text("Subnet Capacity");
  } else {
    $("#btn_ipv4").addClass("active").attr("aria-pressed", "true");
    $("#btn_ipv6").removeClass("active").attr("aria-pressed", "false");
    $("#ipv6_tier_info").addClass("d-none");
    $("#ipv4_tier_info").removeClass("d-none");
    $("#network_label").text("Network Address");
    $("#netsize_label").text("Network Size");
    $("#network").val("10.0.0.0");
    $("#network").attr(
      "pattern",
      "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    );
    $("#netsize").val("16");
    $("#netsize").attr("pattern", netsizePatterns[operatingMode]);
    updateActiveIpv4Preset("16");

    $("#input_form").validate().resetForm();
    $("#input_form #network").rules("remove");
    $("#input_form #network").rules("add", {
      required: true,
      pattern:
        "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
      messages: {
        required: "Please enter a network",
        pattern: "Must be a valid IPv4 Address",
      },
    });
    $("#input_form #netsize").rules("remove");
    $("#input_form #netsize").rules("add", {
      required: true,
      pattern: netsizePatterns[operatingMode],
      messages: {
        required: "Please enter a network size",
        pattern: "Smallest size is /" + minSubnetSizes[operatingMode],
      },
    });

    $("#calc").removeClass("ipv6-mode");
    $("#subnetHeader").text("Subnet Address");
    $("#rangeHeader").text("Range of Addresses");
    $("#hostsHeader").text("Hosts");
    set_usable_ips_title(operatingMode);
  }

  subnetMap = {};
  reset();
}

$("#btn_ipv4").on("click", function () {
  switchIpVersion("IPv4");
});

$("#btn_ipv6").on("click", function () {
  switchIpVersion("IPv6");
});

function isRfc1918(ip) {
  if (!ip || typeof ip !== "string") return false;
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map(Number);
  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return false;

  // 10.0.0.0/8 (10.0.0.0 to 10.255.255.255)
  if (octets[0] === 10) return true;

  // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

  // 192.168.0.0/16 (192.168.0.0 to 192.168.255.255)
  if (octets[0] === 192 && octets[1] === 168) return true;

  return false;
}

function getRfc1918Info(ip) {
  if (!ip || typeof ip !== "string") return null;
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return null;

  if (octets[0] === 10) {
    return { block: "10.0.0.0/8", name: "RFC 1918 (24-bit block)" };
  }
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
    return { block: "172.16.0.0/12", name: "RFC 1918 (20-bit block)" };
  }
  if (octets[0] === 192 && octets[1] === 168) {
    return { block: "192.168.0.0/16", name: "RFC 1918 (16-bit block)" };
  }
  return null;
}

function updateRfc1918Indicator() {
  const net = ($("#network").val() || "").trim();
  const info = getRfc1918Info(net);
  const indicator = $("#rfc1918_indicator");
  if (!indicator.length) return;

  if (ipVersion === "IPv6") {
    indicator.addClass("d-none");
    return;
  }
  indicator.removeClass("d-none");
  if (info) {
    indicator
      .removeClass("bg-secondary-subtle text-secondary border-secondary-subtle")
      .addClass("bg-success-subtle text-success border border-success-subtle")
      .html(
        `<i class="fa-solid fa-shield-halved me-1" aria-hidden="true"></i>${info.name}`,
      );
  } else {
    indicator
      .removeClass("bg-success-subtle text-success border-success-subtle")
      .addClass(
        "bg-secondary-subtle text-secondary border border-secondary-subtle",
      )
      .html(
        '<i class="fa-solid fa-globe me-1" aria-hidden="true"></i>Non-RFC 1918',
      );
  }

  $(".rfc1918-chip").removeClass("active");
  if (info) {
    if (info.block.startsWith("10.")) {
      $('.rfc1918-chip[data-net="10.0.0.0"]').addClass("active");
    } else if (info.block.startsWith("172.")) {
      $('.rfc1918-chip[data-net="172.16.0.0"]').addClass("active");
    } else if (info.block.startsWith("192.")) {
      $('.rfc1918-chip[data-net="192.168.0.0"]').addClass("active");
    }
  }
}

$(document).on("click", ".rfc1918-chip", function () {
  const net = $(this).attr("data-net");
  const size = $(this).attr("data-size") || "16";
  if (ipVersion !== "IPv4") {
    switchIpVersion("IPv4");
  }
  $("#network").val(net);
  $("#netsize").val(size);
  updateActiveIpv4Preset(size);
  $(".rfc1918-chip").removeClass("active");
  $(this).addClass("active");
  $("#btn_go").trigger("click");
});

function updateActiveIpv4Preset(prefix) {
  const p = String(
    prefix !== undefined ? prefix : $("#netsize").val() || "",
  ).trim();
  $(".ipv4-preset-btn").removeClass("active");
  $(`.ipv4-preset-btn[data-prefix="${p}"]`).addClass("active");
  updateRfc1918Indicator();
}

$(document).on("click", ".ipv4-preset-btn", function () {
  const prefix = $(this).attr("data-prefix");
  $("#netsize").val(prefix);
  updateActiveIpv4Preset(prefix);
  $("#btn_go").trigger("click");
});

function updateActiveIpv6Preset(prefix) {
  const p = String(
    prefix !== undefined ? prefix : $("#netsize").val() || "",
  ).trim();
  $(".ipv6-preset-btn").removeClass("active");
  $(`.ipv6-preset-btn[data-prefix="${p}"]`).addClass("active");
}

$(document).on("click", ".ipv6-preset-btn", function () {
  const prefix = $(this).attr("data-prefix");
  $("#netsize").val(prefix);
  updateActiveIpv6Preset(prefix);
  $("#btn_go").trigger("click");
});

$("input#network").on("paste", function (e) {
  const clipboardData =
    (e.originalEvent && e.originalEvent.clipboardData) ||
    window.clipboardData ||
    (window.event && window.event.clipboardData);
  if (!clipboardData) return;
  const pastedData = clipboardData.getData("text").trim();
  if (pastedData.includes("/")) {
    const [network, netSize] = pastedData.split("/");
    if (network.includes(":") && ipVersion !== "IPv6") {
      switchIpVersion("IPv6");
    } else if (network.includes(".") && ipVersion !== "IPv4") {
      switchIpVersion("IPv4");
    }
    $("#network").val(network.trim());
    $("#netsize").val(netSize.trim());
    if (ipVersion === "IPv6") {
      updateActiveIpv6Preset(netSize.trim());
    } else {
      updateActiveIpv4Preset(netSize.trim());
    }
    e.preventDefault();
  }
});

$("input#network").on("keydown", function (e) {
  if (e.key === "/") {
    e.preventDefault();
    $("input#netsize").focus().select();
  }
});

$("input#network,input#netsize").on("input", function () {
  $("#input_form")[0].classList.add("was-validated");
  if (this.id === "netsize") {
    if (ipVersion === "IPv6") {
      updateActiveIpv6Preset($(this).val());
    } else {
      updateActiveIpv4Preset($(this).val());
    }
  } else if (this.id === "network") {
    updateRfc1918Indicator();
  }
});

$("#color_palette button").on("click", function () {
  // We don't really NEED to convert this to hex, but it's really low overhead to do the
  // conversion here and saves us space in the export/save
  if (this.id && this.id.startsWith("palette_picker_")) {
    inflightColor = rgba2hex($(this).css("background-color"));
    $("#color_palette button[id^='palette_picker_']").removeClass(
      "active selected-color",
    );
    $(this).addClass("active selected-color");
  }
});

$("#color_palette button").on("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    $(this).trigger("click");
  }
});

$("#calcbody").on(
  "click",
  ".row_address, .row_range, .row_usable, .row_hosts, .note, input",
  function (event) {
    if (inflightColor !== "NONE") {
      mutate_subnet_map("color", this.dataset.subnet, "", inflightColor);
      $(this).closest("tr").css("background-color", inflightColor);
    }
  },
);

$("#input_form").on("submit", function (e) {
  e.preventDefault();
  $("#btn_go").trigger("click");
});

$("#btn_go").on("click", function (e) {
  if (e && typeof e.preventDefault === "function") {
    e.preventDefault();
  }
  $("#input_form").removeClass("was-validated");
  $("#input_form").validate();
  if ($("#input_form").valid()) {
    $("#input_form")[0].classList.add("was-validated");
    reset();
  } else {
    show_warning_modal("<div>Please correct the errors in the form!</div>");
  }
});

$("#btn_reset").on("click", function (e) {
  if (e && typeof e.preventDefault === "function") {
    e.preventDefault();
  }
  if (ipVersion === "IPv6") {
    $("#network").val("2001:db8::");
    $("#netsize").val("32");
    updateActiveIpv6Preset("32");
    subnetMap = { "2001:db8::/32": {} };
    maxNetSize = 32;
  } else {
    $("#network").val("10.0.0.0");
    $("#netsize").val("16");
    updateActiveIpv4Preset("16");
    subnetMap = { "10.0.0.0/16": {} };
    maxNetSize = 16;
  }
  operatingMode = "Standard";
  switchMode(operatingMode);
  $("#input_form").removeClass("was-validated");
  if ($("#input_form").data("validator")) {
    $("#input_form").validate().resetForm();
  }
  updateRfc1918Indicator();
  renderTable(operatingMode);
  syncUrlState();
});

$("#dropdown_standard").click(function () {
  previousOperatingMode = operatingMode;
  operatingMode = "Standard";

  if (!switchMode(operatingMode)) {
    operatingMode = previousOperatingMode;
    $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
  }
});

$("#dropdown_azure").click(function () {
  previousOperatingMode = operatingMode;
  operatingMode = "AZURE";

  if (!switchMode(operatingMode)) {
    operatingMode = previousOperatingMode;
    $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
  }
});

$("#dropdown_aws").click(function () {
  previousOperatingMode = operatingMode;
  operatingMode = "AWS";

  if (!switchMode(operatingMode)) {
    operatingMode = previousOperatingMode;
    $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
  }
});

$("#dropdown_gcp").click(function () {
  previousOperatingMode = operatingMode;
  operatingMode = "GCP";

  if (!switchMode(operatingMode)) {
    operatingMode = previousOperatingMode;
    $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
  }
});

$("#dropdown_oci").click(function () {
  previousOperatingMode = operatingMode;
  operatingMode = "OCI";

  if (!switchMode(operatingMode)) {
    operatingMode = previousOperatingMode;
    $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
  }
});

$("#importBtn").on("click", function () {
  try {
    const rawVal = $("#importExportArea").val().trim();
    if (!rawVal) return;

    if (rawVal.startsWith("{") || rawVal.startsWith("[")) {
      try {
        const configData = JSON.parse(rawVal);
        importConfig(configData);
        return;
      } catch {
        // Fall through to CSV/Plain text parser
      }
    }

    const parsedItems = parseCsvOrText(rawVal);
    if (parsedItems && parsedItems.length > 0) {
      importFromSubnetList(parsedItems);
    } else {
      show_warning_modal(
        "<div><strong>Import Failed:</strong><br/><br/>Please provide a valid JSON configuration, RFC-4180 CSV, or Plain Text subnet list.</div>",
      );
    }
  } catch {
    show_warning_modal(
      "<div><strong>Import Failed:</strong><br/><br/>Could not parse configuration. Please check your data format.</div>",
    );
  }
});

$("#bottom_nav #colors_word_open").on("click", function () {
  $("#bottom_nav #color_palette").removeClass("d-none");
  $("#bottom_nav #colors_word_close").removeClass("d-none");
  $("#bottom_nav #colors_word_open").addClass("d-none");
});

$("#bottom_nav #colors_word_close").on("click", function () {
  $("#bottom_nav #color_palette").addClass("d-none");
  $("#bottom_nav #colors_word_close").addClass("d-none");
  $("#bottom_nav #colors_word_open").removeClass("d-none");
  $("#color_palette button[id^='palette_picker_']").removeClass(
    "active selected-color",
  );
  inflightColor = "NONE";
});

$(
  "#bottom_nav #colors_word_open, #bottom_nav #colors_word_close, #bottom_nav #copy_url",
).on("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    $(this).trigger("click");
  }
});

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand("copy");
  } catch {
    successful = false;
  }
  document.body.removeChild(textArea);
  return successful;
}

$("#bottom_nav #copy_url").on("click", async function () {
  const url = window.location.origin + getConfigUrl();
  await copyTextToClipboard(url);
  $("#bottom_nav #copy_url span").text("Copied!");
  setTimeout(function () {
    $("#bottom_nav #copy_url span").text("Copy Shareable URL");
  }, 2000);
});

let currentExportFormat = "json";

function getFlatSubnetList(subnetTree = subnetMap) {
  const list = [];
  function traverse(tree) {
    for (const mapKey in tree) {
      if (mapKey.startsWith("_")) continue;
      if (has_network_sub_keys(tree[mapKey])) {
        traverse(tree[mapKey]);
      } else {
        const parts = mapKey.split("/");
        const net = parts[0];
        const size = parseInt(parts[1], 10);
        let rangeCol = "";
        let usableCol = "";
        let hostCount = "";

        if (ipVersion === "IPv6") {
          const netInt = parseIpv6(net);
          const endStr = getIpv6End(net, size);
          const startStr = formatIpv6(netInt);
          if (size >= 128) {
            rangeCol = startStr;
            usableCol = startStr;
          } else if (size === 127) {
            rangeCol = startStr + " - " + endStr;
            usableCol = startStr + " - " + endStr;
          } else if (size >= 64 && size < 112) {
            rangeCol = startStr + " - " + endStr;
            usableCol = formatIpv6(netInt + 1n) + " - " + endStr;
          } else if (size >= 112) {
            rangeCol = startStr + " - " + endStr;
            usableCol = formatIpv6(netInt + 1n) + " - " + endStr;
          } else {
            rangeCol = startStr + " - " + endStr;
            usableCol = "Subnet IDs";
          }
          hostCount = getIpv6Capacity(size);
        } else {
          const addressFirst = ip2int(net);
          const addressLast = subnet_last_address(addressFirst, size);
          const usableFirst = subnet_usable_first(
            addressFirst,
            size,
            operatingMode,
          );
          const usableLast = subnet_usable_last(
            addressFirst,
            size,
            operatingMode,
          );
          hostCount = 1 + usableLast - usableFirst;
          if (size < 32) {
            rangeCol = int2ip(addressFirst) + " - " + int2ip(addressLast);
            usableCol = int2ip(usableFirst) + " - " + int2ip(usableLast);
          } else {
            rangeCol = int2ip(addressFirst);
            usableCol = int2ip(usableFirst);
          }
        }

        list.push({
          cidr: mapKey,
          network: net,
          netSize: size,
          range: rangeCol,
          usable: usableCol,
          hosts: String(hostCount),
          note: tree[mapKey]["_note"] || "",
          color: tree[mapKey]["_color"] || "",
        });
      }
    }
  }
  traverse(subnetTree);
  return list;
}

function exportCsv() {
  const subnets = getFlatSubnetList();
  const headers = [
    "Subnet Address",
    "Range of Addresses",
    "Usable IPs",
    "Hosts",
    "Note",
    "Color",
  ];
  const rows = [headers.map((h) => `"${h}"`).join(",")];
  for (const s of subnets) {
    const row = [
      `"${s.cidr}"`,
      `"${s.range}"`,
      `"${s.usable}"`,
      `"${s.hosts}"`,
      `"${(s.note || "").replace(/"/g, '""')}"`,
      `"${s.color || ""}"`,
    ];
    rows.push(row.join(","));
  }
  return rows.join("\r\n");
}

function exportPlainText() {
  const subnets = getFlatSubnetList();
  if (subnets.length === 0) return "";

  let maxCidr = "Subnet Address".length;
  let maxRange = "Range of Addresses".length;
  let maxUsable = "Usable IPs".length;
  let maxHosts = "Hosts".length;

  for (const s of subnets) {
    if (s.cidr.length > maxCidr) maxCidr = s.cidr.length;
    if (s.range.length > maxRange) maxRange = s.range.length;
    if (s.usable.length > maxUsable) maxUsable = s.usable.length;
    if (String(s.hosts).length > maxHosts) maxHosts = String(s.hosts).length;
  }

  const pad = (str, len) => str + " ".repeat(Math.max(0, len - str.length));
  const baseNet = Object.keys(subnetMap)[0] || "";
  const lines = [
    `# Visual Subnet Calculator Export (${ipVersion} - ${operatingMode} Mode)`,
    `# Base Network: ${baseNet}`,
    "",
    `${pad("Subnet Address", maxCidr + 2)}${pad("Range of Addresses", maxRange + 2)}${pad("Usable IPs", maxUsable + 2)}${pad("Hosts", maxHosts + 2)}Note`,
    "-".repeat(maxCidr + maxRange + maxUsable + maxHosts + 20),
  ];

  for (const s of subnets) {
    let line = `${pad(s.cidr, maxCidr + 2)}${pad(s.range, maxRange + 2)}${pad(s.usable, maxUsable + 2)}${pad(String(s.hosts), maxHosts + 2)}${s.note}`;
    if (s.color) {
      line += ` [${s.color}]`;
    }
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}

function parseCsvOrText(rawText) {
  const lines = rawText.split(/\r?\n/);
  const items = [];
  const cidrRegex =
    /([0-9]{1,3}(?:\.[0-9]{1,3}){3}\/([0-9]{1,2}))|(([0-9a-fA-F:]+)\/([0-9]{1,3}))/;

  for (let line of lines) {
    line = line.trim();
    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith("//") ||
      line.startsWith("---") ||
      line.startsWith("===")
    ) {
      continue;
    }

    let foundCidr = null;
    let note = "";
    let color = "";

    if (line.includes(",")) {
      const cols = [];
      let inQuotes = false;
      let curCol = "";
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            curCol += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          cols.push(curCol.trim());
          curCol = "";
        } else {
          curCol += ch;
        }
      }
      cols.push(curCol.trim());

      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const match = c.match(cidrRegex);
        if (match && !foundCidr) {
          foundCidr = match[0];
          if (cols.length >= 5 && cols[4] && cols[4] !== "Note") {
            note = cols[4];
          }
          if (cols.length >= 6 && cols[5] && cols[5].startsWith("#")) {
            color = cols[5];
          }
          if (
            !note &&
            cols.length >= 2 &&
            i === 0 &&
            !cols[1].includes(" - ") &&
            !/^\d+$/.test(cols[1])
          ) {
            note = cols[1];
          }
          break;
        }
      }
    }

    if (!foundCidr) {
      const match = line.match(cidrRegex);
      if (match) {
        foundCidr = match[0];
        const afterMatch = line.substring(match.index + match[0].length).trim();
        if (afterMatch) {
          const colorMatch = afterMatch.match(/\[(#[0-9a-fA-F]{3,8})\]/);
          if (colorMatch) {
            color = colorMatch[1];
            note = afterMatch.replace(colorMatch[0], "").trim();
          } else {
            note = afterMatch.replace(/^[#,;\t\s]+/, "").trim();
          }
          if (note.includes(" - ")) {
            const tokens = note.split(/\s{2,}|\t/);
            if (tokens.length > 1) {
              const lastToken = tokens[tokens.length - 1];
              if (
                !lastToken.includes(" - ") &&
                !/^\d+$/.test(lastToken) &&
                lastToken !== "Subnet IDs"
              ) {
                note = lastToken;
              } else {
                note = "";
              }
            }
          }
        }
      }
    }

    if (foundCidr) {
      const parts = foundCidr.split("/");
      const net = parts[0];
      const size = parseInt(parts[1], 10);
      if (net.includes(":")) {
        if (size >= 1 && size <= 128) {
          try {
            const pInt = parseIpv6(net);
            const normNet = formatIpv6(pInt);
            items.push({
              cidr: normNet + "/" + size,
              net: normNet,
              size,
              ipVersion: "IPv6",
              note,
              color,
            });
          } catch {
            // invalid IPv6 ignored
          }
        }
      } else {
        if (size >= 1 && size <= 32) {
          const octets = net.split(".").map(Number);
          if (
            octets.length === 4 &&
            octets.every((o) => !isNaN(o) && o >= 0 && o <= 255)
          ) {
            const normNet = get_network(net, size);
            items.push({
              cidr: normNet + "/" + size,
              net: normNet,
              size,
              ipVersion: "IPv4",
              note,
              color,
            });
          }
        }
      }
    }
  }

  return items;
}

function insertSubnetIntoTree(nodeObj, nodeNet, nodeSize, targetItem, version) {
  const nodeCidr = nodeNet + "/" + nodeSize;
  if (nodeCidr === targetItem.cidr) {
    if (targetItem.note) nodeObj["_note"] = targetItem.note;
    if (targetItem.color) nodeObj["_color"] = targetItem.color;
    return;
  }
  if (nodeSize >= targetItem.size) {
    return;
  }

  if (!has_network_sub_keys(nodeObj)) {
    let children = [];
    if (version === "IPv6") {
      children = splitIpv6Network(nodeNet, nodeSize);
    } else {
      children = split_network(nodeNet, nodeSize);
    }
    if (!children || children.length === 0) return;
    for (const childCidr of children) {
      nodeObj[childCidr] = {};
    }
  }

  for (const childCidr in nodeObj) {
    if (childCidr.startsWith("_")) continue;
    const [cNet, cSizeStr] = childCidr.split("/");
    const cSize = parseInt(cSizeStr, 10);
    let isInside = false;

    if (version === "IPv6") {
      const cInt = parseIpv6(cNet);
      const cEnd = parseIpv6(getIpv6End(cNet, cSize));
      const tInt = parseIpv6(targetItem.net);
      if (tInt >= cInt && tInt <= cEnd) {
        isInside = true;
      }
    } else {
      const cFirst = ip2int(cNet);
      const cLast = subnet_last_address(cFirst, cSize);
      const tFirst = ip2int(targetItem.net);
      if (tFirst >= cFirst && tFirst <= cLast) {
        isInside = true;
      }
    }

    if (isInside) {
      insertSubnetIntoTree(
        nodeObj[childCidr],
        cNet,
        cSize,
        targetItem,
        version,
      );
      break;
    }
  }
}

function importFromSubnetList(items) {
  if (!items || items.length === 0) {
    show_warning_modal("<div>No valid subnets or CIDRs found to import!</div>");
    return;
  }

  const isIpv6 = items.some((it) => it.ipVersion === "IPv6");
  const targetIpVersion = isIpv6 ? "IPv6" : "IPv4";
  if (targetIpVersion !== ipVersion) {
    switchIpVersion(targetIpVersion);
  }

  let rootNet = "";
  let rootSize = 0;

  if (targetIpVersion === "IPv6") {
    let minInt = null;
    let maxInt = null;
    for (const it of items) {
      const pInt = parseIpv6(it.net);
      const hostBits = 128 - it.size;
      const endInt = pInt + (1n << BigInt(hostBits)) - 1n;
      if (minInt === null || pInt < minInt) minInt = pInt;
      if (maxInt === null || endInt > maxInt) maxInt = endInt;
    }
    const xor = minInt ^ maxInt;
    let commonPrefix = 128;
    if (xor > 0n) {
      const xorBin = xor.toString(2);
      commonPrefix = 128 - xorBin.length;
    }
    const minSize = Math.min(...items.map((it) => it.size));
    rootSize = Math.min(commonPrefix, minSize);
    const rootInt =
      (minInt >> BigInt(128 - rootSize)) << BigInt(128 - rootSize);
    rootNet = formatIpv6(rootInt);
  } else {
    let minIp = 0xffffffff;
    let maxIp = 0;
    for (const it of items) {
      const pInt = ip2int(it.net);
      const lastInt = subnet_last_address(pInt, it.size);
      if (pInt < minIp) minIp = pInt;
      if (lastInt > maxIp) maxIp = lastInt;
    }
    let commonPrefix = 32;
    const xor = (minIp ^ maxIp) >>> 0;
    if (xor > 0) {
      commonPrefix = 32 - Math.floor(Math.log2(xor) + 1);
    }
    const minSize = Math.min(...items.map((it) => it.size));
    rootSize = Math.min(commonPrefix, minSize);
    rootNet = get_network(int2ip(minIp), rootSize);
  }

  const rootCidr = rootNet + "/" + rootSize;
  const newSubnetMap = {};
  newSubnetMap[rootCidr] = {};

  const sortedItems = [...items].sort((a, b) => a.size - b.size);
  for (const it of sortedItems) {
    insertSubnetIntoTree(
      newSubnetMap[rootCidr],
      rootNet,
      rootSize,
      it,
      targetIpVersion,
    );
  }

  $("#network").val(rootNet);
  $("#netsize").val(rootSize);
  if (targetIpVersion === "IPv6") {
    updateActiveIpv6Preset(rootSize);
  } else {
    updateActiveIpv4Preset(rootSize);
  }
  maxNetSize = rootSize;
  subnetMap = sortIPCIDRs(newSubnetMap);
  renderTable(operatingMode);
}

function switchExportFormat(format, updateContent = true) {
  currentExportFormat = format;
  $("#btn_format_json, #btn_format_csv, #btn_format_txt").removeClass("active");
  if (format === "csv") {
    $("#btn_format_csv").addClass("active");
    if (updateContent) {
      $("#importExportArea").val(exportCsv());
    }
  } else if (format === "txt") {
    $("#btn_format_txt").addClass("active");
    if (updateContent) {
      $("#importExportArea").val(exportPlainText());
    }
  } else {
    $("#btn_format_json").addClass("active");
    if (updateContent) {
      $("#importExportArea").val(JSON.stringify(exportConfig(false), null, 2));
    }
  }
}

$("#btn_import_export").on("click", function () {
  switchExportFormat("json");
});

$("#btn_format_json").on("click", function () {
  switchExportFormat("json");
});

$("#btn_format_csv").on("click", function () {
  switchExportFormat("csv");
});

$("#btn_format_txt").on("click", function () {
  switchExportFormat("txt");
});

$("#btn_copy_export").on("click", async function () {
  const content = $("#importExportArea").val();
  await copyTextToClipboard(content);
  $("#btn_copy_export_text").text("Copied!");
  setTimeout(function () {
    $("#btn_copy_export_text").text("Copy");
  }, 2000);
});

$("#btn_download_export").on("click", function () {
  const content = $("#importExportArea").val();
  if (!content) return;
  let mimeType = "application/json";
  let extension = "json";
  if (currentExportFormat === "csv") {
    mimeType = "text/csv;charset=utf-8;";
    extension = "csv";
  } else if (currentExportFormat === "txt") {
    mimeType = "text/plain;charset=utf-8;";
    extension = "txt";
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const baseNet = Object.keys(subnetMap)[0] || "subnets";
  const cleanBaseNet = baseNet.replace(/[/:]/g, "-");
  a.href = url;
  a.download = `subnet-calc-${cleanBaseNet}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

$("#btn_upload_file").on("click", function () {
  $("#importFileInput").trigger("click");
});

$("#importFileInput").on("change", function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    $("#importExportArea").val(text);
    const fileName = (file.name || "").toLowerCase();
    if (fileName.endsWith(".csv")) {
      switchExportFormat("csv", false);
    } else if (fileName.endsWith(".txt")) {
      switchExportFormat("txt", false);
    } else if (fileName.endsWith(".json")) {
      switchExportFormat("json", false);
    }
  };
  reader.readAsText(file);
  $(this).val("");
});

function reset() {
  if (ipVersion === "IPv6") {
    const netInput = $("#network").val().trim();
    const sizeInput = $("#netsize").val().trim();
    const rootNetwork = getIpv6Network(netInput, sizeInput);
    const rootCidr = rootNetwork + "/" + sizeInput;
    let cidrInput = netInput + "/" + sizeInput;
    if (cidrInput !== rootCidr) {
      show_boundary_warning_modal(netInput, rootNetwork);
      $("#network").val(rootNetwork);
      cidrInput = rootCidr;
    }
    if (Object.keys(subnetMap).length > 0) {
      if (isMatchingSize(Object.keys(subnetMap)[0], cidrInput)) {
        subnetMap = changeBaseNetwork(cidrInput);
      } else {
        subnetMap = {};
        subnetMap[rootCidr] = {};
      }
    } else {
      subnetMap = {};
      subnetMap[rootCidr] = {};
    }
    maxNetSize = parseInt(sizeInput, 10);
    renderTable(operatingMode);
    return;
  }

  set_usable_ips_title(operatingMode);

  let cidrInput = $("#network").val() + "/" + $("#netsize").val();
  const rootNetwork = get_network($("#network").val(), $("#netsize").val());
  const rootCidr = rootNetwork + "/" + $("#netsize").val();
  if (cidrInput !== rootCidr) {
    show_boundary_warning_modal($("#network").val(), rootNetwork);
    $("#network").val(rootNetwork);
    cidrInput = $("#network").val() + "/" + $("#netsize").val();
  }
  if (Object.keys(subnetMap).length > 0) {
    if (isMatchingSize(Object.keys(subnetMap)[0], cidrInput)) {
      subnetMap = changeBaseNetwork(cidrInput);
    } else {
      subnetMap = {};
      subnetMap[rootCidr] = {};
    }
  } else {
    subnetMap = {};
    subnetMap[rootCidr] = {};
  }
  maxNetSize = parseInt($("#netsize").val(), 10);
  renderTable(operatingMode);
  updateRfc1918Indicator();
}

function changeBaseNetwork(newBaseNetwork) {
  const miniSubnetMap = {};
  minifySubnetMap(miniSubnetMap, subnetMap, Object.keys(subnetMap)[0]);
  const newSubnetMap = {};
  expandSubnetMap(newSubnetMap, miniSubnetMap, newBaseNetwork);
  return newSubnetMap;
}

function isMatchingSize(subnet1, subnet2) {
  return subnet1.split("/")[1] === subnet2.split("/")[1];
}

$("#calcbody").on("click", "td.split,td.join", function () {
  mutate_subnet_map(this.dataset.mutateVerb, this.dataset.subnet, "");
  renderTable(operatingMode);
});

$("#calcbody").on("keyup", "td.note input", function () {
  const delay = 1000;
  clearTimeout(noteTimeout);
  noteTimeout = setTimeout(
    function (element) {
      mutate_subnet_map("note", element.dataset.subnet, "", element.value);
    },
    delay,
    this,
  );
});

$("#calcbody").on("focusout", "td.note input", function () {
  clearTimeout(noteTimeout);
  mutate_subnet_map("note", this.dataset.subnet, "", this.value);
});

function renderTable(operatingMode) {
  $("#calcbody").empty();
  const maxDepth = get_dict_max_depth(subnetMap, 0);
  addRowTree(subnetMap, 0, maxDepth, operatingMode);
  syncUrlState();
}

function addRowTree(subnetTree, depth, maxDepth, operatingMode) {
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
      if (showParentHeaders) {
        addParentHeaderRow(mapKey, depth, maxDepth);
      }
      addRowTree(subnetTree[mapKey], depth + 1, maxDepth, operatingMode);
    } else {
      const subnet_split = mapKey.split("/");
      let notesWidth = "30%";
      if (maxDepth > 5 && maxDepth <= 10) {
        notesWidth = "25%";
      } else if (maxDepth > 10 && maxDepth <= 15) {
        notesWidth = "20%";
      } else if (maxDepth > 15 && maxDepth <= 20) {
        notesWidth = "15%";
      } else if (maxDepth > 20) {
        notesWidth = "10%";
      }
      addRow(
        subnet_split[0],
        parseInt(subnet_split[1], 10),
        infoColumnCount + maxDepth - depth,
        subnetTree[mapKey]["_note"] || "",
        notesWidth,
        subnetTree[mapKey]["_color"] || "",
        operatingMode,
      );
    }
  }
}

function addRow(
  network,
  netSize,
  colspan,
  note,
  notesWidth,
  color,
  operatingMode,
) {
  let rangeCol,
    usableCol,
    hostCount,
    rowId,
    rowCIDR,
    isLeaf = false;
  if (ipVersion === "IPv6") {
    rowCIDR = network + "/" + netSize;
    rowId = "row_" + network.replace(/:/g, "-") + "_" + netSize;
    const netInt = parseIpv6(network);
    const endStr = getIpv6End(network, netSize);
    const startStr = formatIpv6(netInt);
    if (netSize >= 128) {
      rangeCol = startStr;
      usableCol = startStr;
      isLeaf = true;
    } else if (netSize === 127) {
      rangeCol = startStr + " - " + endStr;
      usableCol = startStr + " - " + endStr;
      isLeaf = false;
    } else if (netSize >= 64 && netSize < 112) {
      rangeCol = startStr + " - " + endStr;
      usableCol = formatIpv6(netInt + 1n) + " - " + endStr;
      isLeaf = true;
    } else if (netSize >= 112) {
      rangeCol = startStr + " - " + endStr;
      usableCol = formatIpv6(netInt + 1n) + " - " + endStr;
      isLeaf = false;
    } else {
      rangeCol = startStr + " - " + endStr;
      usableCol = "Subnet IDs";
    }
    hostCount = getIpv6Capacity(netSize);
  } else {
    const addressFirst = ip2int(network);
    const addressLast = subnet_last_address(addressFirst, netSize);
    const usableFirst = subnet_usable_first(
      addressFirst,
      netSize,
      operatingMode,
    );
    const usableLast = subnet_usable_last(addressFirst, netSize, operatingMode);
    hostCount = 1 + usableLast - usableFirst;
    if (netSize < 32) {
      rangeCol = int2ip(addressFirst) + " - " + int2ip(addressLast);
      usableCol = int2ip(usableFirst) + " - " + int2ip(usableLast);
    } else {
      rangeCol = int2ip(addressFirst);
      usableCol = int2ip(usableFirst);
    }
    rowId = "row_" + network.replace(/\./g, "-") + "_" + netSize;
    rowCIDR = network + "/" + netSize;
  }

  let styleTag = "";
  const safeColor = sanitizeColor(color);
  if (safeColor !== "") {
    styleTag = ' style="background-color: ' + safeColor + '"';
  }

  const sanitizedNote = escapeHtml(note);
  const splitClass = isLeaf ? "split rotate split-disabled" : "split rotate";
  const splitLabel = isLeaf ? "/" + netSize + " (Leaf)" : "/" + netSize;

  let newRow =
    '            <tr id="' +
    rowId +
    '"' +
    styleTag +
    '  aria-label="' +
    rowCIDR +
    '">\n' +
    '                <td data-subnet="' +
    rowCIDR +
    '" aria-labelledby="' +
    rowId +
    ' subnetHeader" class="row_address">' +
    rowCIDR +
    "</td>\n" +
    '                <td data-subnet="' +
    rowCIDR +
    '" aria-labelledby="' +
    rowId +
    ' rangeHeader" class="row_range">' +
    rangeCol +
    "</td>\n" +
    '                <td data-subnet="' +
    rowCIDR +
    '" aria-labelledby="' +
    rowId +
    ' useableHeader" class="row_usable">' +
    usableCol +
    "</td>\n" +
    '                <td data-subnet="' +
    rowCIDR +
    '" aria-labelledby="' +
    rowId +
    ' hostsHeader" class="row_hosts">' +
    hostCount +
    "</td>\n" +
    '                <td class="note" style="width:' +
    notesWidth +
    '"><label><input id="note_' +
    rowId +
    '" name="note_' +
    rowId +
    '" aria-labelledby="' +
    rowId +
    ' noteHeader" type="text" class="form-control shadow-none p-0" data-subnet="' +
    rowCIDR +
    '" value="' +
    sanitizedNote +
    '"></label></td>\n' +
    '                <td data-subnet="' +
    rowCIDR +
    '" aria-labelledby="' +
    rowId +
    ' splitHeader" rowspan="1" colspan="' +
    colspan +
    '" class="' +
    splitClass +
    '" data-mutate-verb="split"><span>' +
    splitLabel +
    "</span></td>\n";
  if (netSize > maxNetSize) {
    const matchingNetworkList = get_matching_network_list(
      network,
      subnetMap,
    ).slice(1);
    for (const i in matchingNetworkList) {
      const matchingNetwork = matchingNetworkList[i];
      const networkChildrenCount = count_network_children(
        matchingNetwork,
        subnetMap,
        [],
      );
      newRow +=
        '                <td aria-label="' +
        matchingNetwork +
        ' Join" rowspan="' +
        networkChildrenCount +
        '" colspan="1" class="join rotate" data-subnet="' +
        matchingNetwork +
        '" data-mutate-verb="join"><span>/' +
        matchingNetwork.split("/")[1] +
        "</span></td>\n";
    }
  }
  newRow += "            </tr>";

  $("#calcbody").append(newRow);
}

// Helper Functions
function ip2int(ip) {
  return (
    ip
      .split(".")
      .reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

function int2ip(ipInt) {
  return (
    (ipInt >>> 24) +
    "." +
    ((ipInt >> 16) & 255) +
    "." +
    ((ipInt >> 8) & 255) +
    "." +
    (ipInt & 255)
  );
}

function toBase36(num) {
  return num.toString(36);
}

function fromBase36(str) {
  return parseInt(str, 36);
}

/**
 * Coordinate System for Subnet Representation
 */
function getNthSubnet(baseNetwork, specificSubnet) {
  const [baseIp, baseMask] = baseNetwork.split("/");
  const [specificIp, specificMask] = specificSubnet.split("/");

  if (baseIp.includes(":")) {
    const baseInt = parseIpv6(baseIp);
    const specificInt = parseIpv6(specificIp);
    const specificSize = 128n - BigInt(specificMask);
    const offset = specificInt - baseInt;
    const nthSubnet = offset >> specificSize;
    return `${nthSubnet.toString(36)}_${parseInt(specificMask, 10).toString(36)}`;
  }

  const baseInt = ip2int(baseIp);
  const specificInt = ip2int(specificIp);

  const specificSize = 32 - parseInt(specificMask, 10);
  const offset = specificInt - baseInt;
  const nthSubnet = offset >>> specificSize;

  return `${nthSubnet}${toBase36(parseInt(specificMask, 10))}`;
}

function getSubnetFromNth(baseNetwork, nthString) {
  const [baseIp] = baseNetwork.split("/");
  if (baseIp.includes(":")) {
    const parts = nthString.split("_");
    const nth = BigInt(parseInt(parts[0], 36));
    const size = parseInt(parts[1], 36);
    const baseInt = parseIpv6(baseIp);
    const innerSize = 128n - BigInt(size);
    const subnetInt = baseInt + (nth << innerSize);
    return `${formatIpv6(subnetInt)}/${size}`;
  }

  const baseInt = ip2int(baseIp);
  const size = fromBase36(nthString.slice(-1));
  const nth = parseInt(nthString.slice(0, -1), 10);

  const innerSizeInt = 32 - size;
  const subnetInt = baseInt + (nth << innerSizeInt);

  return `${int2ip(subnetInt)}/${size}`;
}

function subnet_last_address(subnet, netSize) {
  return subnet + subnet_addresses(netSize) - 1;
}

function subnet_addresses(netSize) {
  return 2 ** (32 - netSize);
}

function subnet_usable_first(network, netSize, operatingMode) {
  if (netSize < 31) {
    switch (operatingMode) {
      case "AWS":
      case "AZURE":
        return network + 4;
      case "GCP":
      case "OCI":
        return network + 2;
      default:
        return network + 1;
    }
  } else {
    return network;
  }
}

function subnet_usable_last(network, netSize, operatingMode) {
  const last_address = subnet_last_address(network, netSize);
  if (netSize < 31) {
    if (operatingMode === "GCP") {
      return last_address - 2;
    }
    return last_address - 1;
  } else {
    return last_address;
  }
}

function get_dict_max_depth(dict, curDepth) {
  let maxDepth = curDepth;
  for (const mapKey in dict) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    const newDepth = get_dict_max_depth(dict[mapKey], curDepth + 1);
    if (newDepth > maxDepth) {
      maxDepth = newDepth;
    }
  }
  return maxDepth;
}

function has_network_sub_keys(dict) {
  if (!dict || typeof dict !== "object") return false;
  for (const key of Object.keys(dict)) {
    if (!key.startsWith("_") && key !== "n" && key !== "c") {
      return true;
    }
  }
  return false;
}

function count_network_children(network, subnetTree, ancestryList) {
  let childCount = 0;
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
      childCount += count_network_children(
        network,
        subnetTree[mapKey],
        ancestryList.concat([mapKey]),
      );
    } else {
      if (ancestryList.includes(network)) {
        childCount += 1;
      }
    }
  }
  return childCount;
}

function get_matching_network_list(network, subnetTree) {
  const subnetList = [];
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
      subnetList.push(
        ...get_matching_network_list(network, subnetTree[mapKey]),
      );
    }
    if (mapKey.split("/")[0] === network) {
      subnetList.push(mapKey);
    }
  }
  return subnetList;
}

function get_consolidated_property(subnetTree, property) {
  const allValues = get_property_values(subnetTree, property);
  const allValuesMatch = allValues.every((val, i, arr) => val === arr[0]);
  if (allValuesMatch) {
    return allValues[0];
  } else {
    return "";
  }
}

function get_property_values(subnetTree, property) {
  const propValues = [];
  for (const mapKey in subnetTree) {
    if (has_network_sub_keys(subnetTree[mapKey])) {
      propValues.push(...get_property_values(subnetTree[mapKey], property));
    } else {
      propValues.push(subnetTree[mapKey][property] || "");
    }
  }
  return propValues;
}

function get_network(networkInput, netSize) {
  const ipInt = ip2int(networkInput);
  netSize = parseInt(netSize, 10);
  if (netSize === 0) return "0.0.0.0";
  if (netSize === 32) return int2ip(ipInt);
  const mask = (0xffffffff << (32 - netSize)) >>> 0;
  return int2ip((ipInt & mask) >>> 0);
}

function split_network(networkInput, netSize) {
  const subnets = [networkInput + "/" + (netSize + 1)];
  const newSubnet = ip2int(networkInput) + 2 ** (32 - netSize - 1);
  subnets.push(int2ip(newSubnet) + "/" + (netSize + 1));
  return subnets;
}

function mutate_subnet_map(verb, network, subnetTree, propValue = "") {
  if (subnetTree === "") {
    subnetTree = subnetMap;
  }
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
      mutate_subnet_map(verb, network, subnetTree[mapKey], propValue);
    }
    if (mapKey === network) {
      const netSplit = mapKey.split("/");
      const netSize = parseInt(netSplit[1], 10);
      if (verb === "split") {
        if (ipVersion === "IPv6") {
          if (netSize < 64 || (netSize >= 80 && netSize <= 127)) {
            const new_networks = splitIpv6Network(netSplit[0], netSize);
            for (const sub of new_networks) {
              subnetTree[mapKey][sub] = {};
            }
            if (
              Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_note")
            ) {
              for (const sub of new_networks) {
                subnetTree[mapKey][sub]["_note"] = subnetTree[mapKey]["_note"];
              }
            }
            delete subnetTree[mapKey]["_note"];
            if (
              Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_color")
            ) {
              for (const sub of new_networks) {
                subnetTree[mapKey][sub]["_color"] =
                  subnetTree[mapKey]["_color"];
              }
            }
            delete subnetTree[mapKey]["_color"];
          } else if (netSize >= 128) {
            show_warning_modal(
              "<div><strong>Host / Loopback Boundary:</strong><br/><br/>An IPv6 <strong>/128</strong> prefix represents a single host or loopback address (RFC 4291) and cannot be split any further.</div>",
            );
          } else {
            show_warning_modal(
              "<div><strong>SLAAC Boundary Reached:</strong><br/><br/>IPv6 subnets should not be split smaller than <strong>/64</strong>.<br/>A /64 prefix is required by RFC 4291 and RFC 7421 for Stateless Address Autoconfiguration (SLAAC) and standard local network routing.<br/><br/><em>Note: For special sub-delegations (such as /80, /96, /112, /120, /124, or /127 point-to-point links), select the corresponding preset directly from the toolbar.</em></div>",
            );
          }
        } else if (netSize < minSubnetSizes[operatingMode]) {
          const new_networks = split_network(netSplit[0], netSize);
          subnetTree[mapKey][new_networks[0]] = {};
          subnetTree[mapKey][new_networks[1]] = {};
          if (
            Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_note")
          ) {
            subnetTree[mapKey][new_networks[0]]["_note"] =
              subnetTree[mapKey]["_note"];
            subnetTree[mapKey][new_networks[1]]["_note"] =
              subnetTree[mapKey]["_note"];
          }
          delete subnetTree[mapKey]["_note"];
          if (
            Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_color")
          ) {
            subnetTree[mapKey][new_networks[0]]["_color"] =
              subnetTree[mapKey]["_color"];
            subnetTree[mapKey][new_networks[1]]["_color"] =
              subnetTree[mapKey]["_color"];
          }
          delete subnetTree[mapKey]["_color"];
        } else {
          let modalErrorMessage = "";
          switch (operatingMode) {
            case "AWS":
              modalErrorMessage =
                "The minimum IPv4 subnet size for AWS is /" +
                minSubnetSizes[operatingMode] +
                '.<br/><br/>More Information:<br/><a href="https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html#subnet-sizing-ipv4" target="_blank" rel="noopener noreferrer">Amazon Virtual Private Cloud > User Guide > Subnet CIDR Blocks > Subnet Sizing for IPv4</a>';
              break;
            case "AZURE":
              modalErrorMessage =
                "The minimum IPv4 subnet size for Azure is /" +
                minSubnetSizes[operatingMode] +
                '.<br/><br/>More Information:<br/><a href="https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#how-small-and-how-large-can-virtual-networks-and-subnets-be" target="_blank" rel="noopener noreferrer">Azure Virtual Network FAQ > How small and how large can virtual networks and subnets be?</a>';
              break;
            case "GCP":
              modalErrorMessage =
                "The minimum IPv4 subnet size for GCP is /" +
                minSubnetSizes[operatingMode] +
                '.<br/><br/>More Information:<br/><a href="https://cloud.google.com/vpc/docs/subnets#unusable-ip-addresses-in-every-subnet" target="_blank" rel="noopener noreferrer">Google Cloud VPC > Subnets > Unusable addresses in IPv4 subnet ranges</a>';
              break;
            case "OCI":
              modalErrorMessage =
                "The minimum IPv4 subnet size for OCI is /" +
                minSubnetSizes[operatingMode] +
                '.<br/><br/>More Information:<br/><a href="https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet" target="_blank" rel="noopener noreferrer">Infrastructure Services>Networking>Networking Overview>Three IP Addresses in Each Subnet</a>';
              break;
            default:
              modalErrorMessage =
                "The minimum size for an IPv4 subnet is /" +
                minSubnetSizes[operatingMode] +
                '.<br/><br/>More Information:<br/><a href="https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing" target="_blank" rel="noopener noreferrer">Wikipedia - Classless Inter-Domain Routing</a>';
              break;
          }
          show_warning_modal("<div>" + modalErrorMessage + "</div>");
        }
      } else if (verb === "join") {
        subnetTree[mapKey] = {
          _note: get_consolidated_property(subnetTree[mapKey], "_note"),
          _color: get_consolidated_property(subnetTree[mapKey], "_color"),
        };
      } else if (verb === "note") {
        subnetTree[mapKey]["_note"] = propValue;
      } else if (verb === "color") {
        subnetTree[mapKey]["_color"] = propValue;
      }
    }
  }
}

function switchMode(operatingMode) {
  let isSwitched = true;

  if (subnetMap !== null) {
    if (validateSubnetSizes(subnetMap, minSubnetSizes[operatingMode])) {
      renderTable(operatingMode);
      set_usable_ips_title(operatingMode);

      $("#netsize").attr("pattern", netsizePatterns[operatingMode]);
      $("#input_form").removeClass("was-validated");
      $("#input_form").rules("remove", "netsize");

      let validateErrorMessage = "";
      switch (operatingMode) {
        case "AWS":
          validateErrorMessage =
            "AWS Mode - Smallest size is /" + minSubnetSizes[operatingMode];
          break;
        case "AZURE":
          validateErrorMessage =
            "Azure Mode - Smallest size is /" + minSubnetSizes[operatingMode];
          break;
        case "GCP":
          validateErrorMessage =
            "GCP Mode - Smallest size is /" + minSubnetSizes[operatingMode];
          break;
        case "OCI":
          validateErrorMessage =
            "OCI Mode - Smallest size is /" + minSubnetSizes[operatingMode];
          break;
        default:
          validateErrorMessage =
            "Smallest size is /" + minSubnetSizes[operatingMode];
          break;
      }

      $("#input_form #netsize").rules("add", {
        required: true,
        pattern: netsizePatterns[operatingMode],
        messages: {
          required: "Please enter a network size",
          pattern: validateErrorMessage,
        },
      });

      $(
        "#dropdown_standard, #dropdown_azure, #dropdown_aws, #dropdown_gcp, #dropdown_oci",
      ).removeClass("active");
      $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
      isSwitched = true;
    } else {
      let modalErrorMessage = "";
      switch (operatingMode) {
        case "AWS":
          modalErrorMessage =
            "One or more subnets are smaller than the minimum allowed for AWS.<br/>The smallest size allowed is /" +
            minSubnetSizes[operatingMode] +
            '.<br/>See: <a href="https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html#subnet-sizing-ipv4" target="_blank" rel="noopener noreferrer">Amazon Virtual Private Cloud > User Guide > Subnet CIDR Blocks > Subnet Sizing for IPv4</a>';
          break;
        case "AZURE":
          modalErrorMessage =
            "One or more subnets are smaller than the minimum allowed for Azure.<br/>The smallest size allowed is /" +
            minSubnetSizes[operatingMode] +
            '.<br/>See: <a href="https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#how-small-and-how-large-can-virtual-networks-and-subnets-be" target="_blank" rel="noopener noreferrer">Azure Virtual Network FAQ > How small and how large can virtual networks and subnets be?</a>';
          break;
        case "GCP":
          modalErrorMessage =
            "One or more subnets are smaller than the minimum allowed for GCP.<br/>The smallest size allowed is /" +
            minSubnetSizes[operatingMode] +
            '.<br/>See: <a href="https://cloud.google.com/vpc/docs/subnets#unusable-ip-addresses-in-every-subnet" target="_blank" rel="noopener noreferrer">Google Cloud VPC > Subnets > Unusable addresses in IPv4 subnet ranges</a>';
          break;
        case "OCI":
          modalErrorMessage =
            "One or more subnets are smaller than the minimum allowed for OCI.<br/>The smallest size allowed is /" +
            minSubnetSizes[operatingMode] +
            '.<br/>See: <a href="https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet" target="_blank" rel="noopener noreferrer">Infrastructure Services>Networking>Networking Overview>Three IP Addresses in Each Subnet</a>';
          break;
        default:
          modalErrorMessage = "Unknown Error";
          break;
      }
      show_warning_modal("<div>" + modalErrorMessage + "</div>");
      isSwitched = false;
    }
  } else {
    reset();
  }

  return isSwitched;
}

function validateSubnetSizes(subnetMap, minSubnetSize) {
  let isValid = true;
  const validate = (subnetTree) => {
    for (const key in subnetTree) {
      if (key.startsWith("_")) continue;
      const [, size] = key.split("/");
      if (parseInt(size, 10) > minSubnetSize) {
        isValid = false;
        return;
      }
      if (typeof subnetTree[key] === "object") {
        validate(subnetTree[key]);
      }
    }
  };
  validate(subnetMap);
  return isValid;
}

function set_usable_ips_title(operatingMode) {
  switch (operatingMode) {
    case "AWS":
      $("#useableHeader").html(
        'Usable IPs (<a href="https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html#subnet-sizing-ipv4" target="_blank" rel="noopener noreferrer" class="reserved-info-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="AWS reserves 5 addresses in each subnet for platform use.<br/>Click to navigate to the AWS documentation.">AWS</a>)',
      );
      break;
    case "AZURE":
      $("#useableHeader").html(
        'Usable IPs (<a href="https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets" target="_blank" rel="noopener noreferrer" class="reserved-info-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="Azure reserves 5 addresses in each subnet for platform use.<br/>Click to navigate to the Azure documentation.">Azure</a>)',
      );
      break;
    case "GCP":
      $("#useableHeader").html(
        'Usable IPs (<a href="https://cloud.google.com/vpc/docs/subnets#unusable-ip-addresses-in-every-subnet" target="_blank" rel="noopener noreferrer" class="reserved-info-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="GCP reserves 4 addresses in each subnet for platform use.<br/>Click to navigate to the GCP documentation.">GCP</a>)',
      );
      break;
    case "OCI":
      $("#useableHeader").html(
        'Usable IPs (<a href="https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet" target="_blank" rel="noopener noreferrer" class="reserved-info-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="OCI reserves 3 addresses in each subnet for platform use.<br/>Click to navigate to the OCI documentation.">OCI</a>)',
      );
      break;
    default:
      $("#useableHeader").html("Usable IPs");
      break;
  }
  $('[data-bs-toggle="tooltip"]').each(function () {
    const existing = bootstrap.Tooltip.getInstance(this);
    if (existing) existing.dispose();
    new bootstrap.Tooltip(this);
  });
}

function show_boundary_warning_modal(originalValue, correctedValue) {
  const notifyModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("notifyModal"),
  );
  const modalBody = $("#notifyModal .modal-body");
  modalBody.empty();
  $("<div></div>")
    .text(
      "Your network input is not on a network boundary for this network size. It has been automatically changed:",
    )
    .appendTo(modalBody);
  $('<div class="font-monospace pt-2"></div>')
    .text(originalValue + " -> " + correctedValue)
    .appendTo(modalBody);
  notifyModal.show();
}

function show_warning_modal(messageHtml) {
  const notifyModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("notifyModal"),
  );
  const modalBody = $("#notifyModal .modal-body");
  modalBody.empty();
  modalBody.html(messageHtml);
  notifyModal.show();
}

$(document).ready(function () {
  $(document).on("click", ".modal [data-bs-dismiss='modal']", function () {
    const modalEl = $(this).closest(".modal")[0];
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (
        modalInstance &&
        modalInstance._isTransitioning &&
        modalEl.classList.contains("show")
      ) {
        modalEl._pendingDismiss = true;
      }
    }
  });

  $(document).on("shown.bs.modal", ".modal", function () {
    if (this._pendingDismiss) {
      this._pendingDismiss = false;
      const modalInstance =
        typeof bootstrap !== "undefined" && bootstrap.Modal
          ? bootstrap.Modal.getInstance(this)
          : null;
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  });

  $(document).on("hide.bs.modal hidden.bs.modal", ".modal", function () {
    this._pendingDismiss = false;
  });

  $("#input_form").validate({
    onfocusout: function (element) {
      $(element).valid();
    },
    rules: {
      network: {
        required: true,
        pattern:
          "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
      },
      netsize: {
        required: true,
        pattern: "^([0-9]|[12][0-9]|3[0-2])$",
      },
    },
    messages: {
      network: {
        required: "Please enter a network",
        pattern: "Must be a valid IPv4 Address",
      },
      netsize: {
        required: "Please enter a network size",
        pattern: "Smallest size is /32",
      },
    },
    errorPlacement: function (error, element) {
      if (error[0].innerHTML !== "") {
        if (!element.data("errorIsVisible")) {
          const tooltipInstance = bootstrap.Tooltip.getInstance(element[0]);
          if (tooltipInstance) {
            tooltipInstance.setContent({
              ".tooltip-inner": error[0].innerHTML,
            });
          }
          element.tooltip("show");
          element.data("errorIsVisible", true);
        }
      } else {
        if (element.data("errorIsVisible")) {
          element.tooltip("hide");
          element.data("errorIsVisible", false);
        }
      }
    },
    success: function () {},
    submitHandler: function (form) {
      form.classList.add("was-validated");
      form.submit();
    },
  });

  const autoConfigResult = processConfigUrl();
  if (!autoConfigResult) {
    let draftRestored = false;
    try {
      if (typeof TemporaryCookieStore !== "undefined") {
        const draftUrl = TemporaryCookieStore.get("vsc_draft_15m");
        if (draftUrl && draftUrl.includes("?")) {
          const queryString = draftUrl.split("?")[1];
          if (queryString) {
            const tempParams = new URLSearchParams(queryString);
            if (tempParams.has("network") && tempParams.has("mask")) {
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, "", draftUrl);
              }
              draftRestored = processConfigUrl();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Draft restore failed:", e);
    }
    if (!draftRestored) {
      reset();
    }
  }
  updateRfc1918Indicator();

  $("#faq_expand_all").on("click", function () {
    $("#faqAccordion .accordion-collapse").each(function () {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(this, {
        toggle: false,
      });
      bsCollapse.show();
    });
  });

  $("#faq_collapse_all").on("click", function () {
    $("#faqAccordion .accordion-collapse").each(function () {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(this, {
        toggle: false,
      });
      bsCollapse.hide();
    });
  });

  $("#toggle_parent_headers").on("click", function (e) {
    e.preventDefault();
    showParentHeaders = !showParentHeaders;
    const text = showParentHeaders
      ? "Hide Parent Headers"
      : "Show Parent Headers";
    $("#parent_headers_text").text(text);
    $(this).toggleClass("active", showParentHeaders);
    renderTable(operatingMode);
  });
});

function binToAscii(str) {
  let curOut = "";
  let curBit = 0;
  let curChar = 0;

  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === "1") {
      curChar |= 1 << curBit;
    }
    curBit++;
    if (curBit > 3) {
      curOut += curChar.toString(16);
      curChar = 0;
      curBit = 0;
    }
  }
  if (curBit > 0) {
    curOut += curChar.toString(16);
  }
  return str.length + "." + curOut;
}

function asciiToBin(str) {
  const re = /([0-9]+)\.([0-9a-f]+)/i;
  const res = re.exec(str);
  if (!res) return "";
  const len = parseInt(res[1], 10);
  const encoded = res[2];
  let out = "";
  for (let i = 0; i < len; i++) {
    const ch = parseInt(encoded.charAt(Math.floor(i / 4)), 16);
    const pos = i % 4;
    out += ch & (1 << pos) ? "1" : "0";
  }
  return out;
}

function decodeDivisionTree(baseNet, baseMask, divisionStr) {
  const bin = asciiToBin(divisionStr);
  let ptr = 0;
  const rootCidr = baseNet + "/" + baseMask;
  const newMap = {};
  newMap[rootCidr] = {};

  function buildNode(netStr, maskNum, targetObj) {
    if (ptr >= bin.length) return;
    const bit = bin.charAt(ptr++);
    if (bit === "1") {
      let children = [];
      if (ipVersion === "IPv6" || netStr.includes(":")) {
        children = splitIpv6Network(netStr, maskNum);
      } else {
        children = split_network(netStr, maskNum);
      }
      if (children.length >= 2) {
        for (const child of children) {
          targetObj[child] = {};
          const childParts = child.split("/");
          buildNode(
            childParts[0],
            parseInt(childParts[1], 10),
            targetObj[child],
          );
        }
      }
    }
  }

  buildNode(baseNet, baseMask, newMap[rootCidr]);
  return newMap;
}

function encodeDivisionTree(map) {
  const rootKey = Object.keys(map)[0];
  if (!rootKey) return "";
  let bin = "";

  function traverse(nodeObj) {
    const subKeys = Object.keys(nodeObj).filter(
      (k) => !k.startsWith("_") && k !== "n" && k !== "c",
    );
    if (subKeys.length >= 2) {
      bin += "1";
      if (ipVersion === "IPv6" || rootKey.includes(":")) {
        subKeys.sort((a, b) => {
          const intA = parseIpv6(a.split("/")[0]);
          const intB = parseIpv6(b.split("/")[0]);
          return intA < intB ? -1 : intA > intB ? 1 : 0;
        });
      } else {
        subKeys.sort((a, b) => {
          const ipA = ip2int(a.split("/")[0]);
          const ipB = ip2int(b.split("/")[0]);
          return ipA - ipB;
        });
      }
      for (const key of subKeys) {
        traverse(nodeObj[key]);
      }
    } else {
      bin += "0";
    }
  }

  traverse(map[rootKey]);
  return binToAscii(bin);
}

function extractNotesAndColors(map) {
  const meta = {};
  function traverse(node) {
    for (const k of Object.keys(node)) {
      if (k.startsWith("_")) continue;
      const sub = node[k];
      if (sub && (sub._note || sub._color)) {
        meta[k] = {};
        if (sub._note) meta[k].n = sub._note;
        if (sub._color) meta[k].c = sub._color;
      }
      if (typeof sub === "object") {
        traverse(sub);
      }
    }
  }
  traverse(map);
  return meta;
}

function applyNotesAndColors(map, meta) {
  if (!meta || typeof meta !== "object") return;
  function traverse(node) {
    for (const k of Object.keys(node)) {
      if (k.startsWith("_")) continue;
      if (meta[k]) {
        if (meta[k].n) node[k]._note = meta[k].n;
        if (meta[k].c) node[k]._color = meta[k].c;
      }
      if (typeof node[k] === "object") {
        traverse(node[k]);
      }
    }
  }
  traverse(map);
}

function getLiveUrl() {
  const rootKey = Object.keys(subnetMap)[0];
  if (!rootKey) return window.location.pathname;
  const rootParts = rootKey.split("/");
  const params = new URLSearchParams();

  if (ipVersion === "IPv6") {
    params.set("ipv", "6");
  }
  params.set("network", rootParts[0]);
  params.set("mask", rootParts[1]);

  const division = encodeDivisionTree(subnetMap);
  if (division) {
    params.set("division", division);
  }
  if (operatingMode && operatingMode !== "Standard") {
    params.set("mode", operatingMode);
  }
  if (showParentHeaders) {
    params.set("parent_headers", "1");
  }
  const meta = extractNotesAndColors(subnetMap);
  if (Object.keys(meta).length > 0) {
    params.set(
      "meta",
      LZString.compressToEncodedURIComponent(JSON.stringify(meta)),
    );
  }

  const query = params.toString();
  return window.location.pathname + (query ? "?" + query : "");
}

function syncUrlState() {
  try {
    const liveUrl = getLiveUrl();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", liveUrl);
    }
    const liveLink = document.getElementById("live_shareable_url");
    if (liveLink) {
      const fullUrl = window.location.origin + liveUrl;
      liveLink.href = fullUrl;
      liveLink.textContent = fullUrl;
      liveLink.setAttribute(
        "aria-label",
        "Live Shareable Subnet Configuration URL",
      );
    }
    if (typeof TemporaryCookieStore !== "undefined") {
      TemporaryCookieStore.set("vsc_draft_15m", liveUrl, 900);
      const cookieBadge = document.getElementById("cookie_session_badge");
      if (cookieBadge) {
        cookieBadge.style.display = "inline-flex";
        const badgeText = document.getElementById("cookie_session_badge_text");
        if (badgeText) {
          badgeText.textContent = "Session Cookie: 15 Mins";
        }
      }
    }
  } catch (err) {
    console.warn("syncUrlState failed:", err);
  }
}

function addParentHeaderRow(cidr, depth, maxDepth) {
  const parts = cidr.split("/");
  const net = parts[0];
  const netSize = parseInt(parts[1], 10);
  let rangeStr = "";
  let hostStr = "";
  if (ipVersion === "IPv6") {
    const netInt = parseIpv6(net);
    const endStr = getIpv6End(net, netSize);
    rangeStr = formatIpv6(netInt) + " - " + endStr;
    hostStr = getIpv6Capacity(netSize);
  } else {
    const addressFirst = ip2int(net);
    const addressLast = subnet_last_address(addressFirst, netSize);
    rangeStr = int2ip(addressFirst) + " - " + int2ip(addressLast);
    hostStr = (1 + addressLast - addressFirst).toLocaleString();
  }

  const indent = "&nbsp;".repeat(depth * 3);
  const parentRow =
    '<tr class="parent-header-row" aria-label="Parent ' +
    cidr +
    '">\n' +
    '  <td class="row_address text-muted font-monospace"><span class="badge bg-secondary me-1"><i class="fa-solid fa-folder-tree me-1" aria-hidden="true"></i>Parent</span> ' +
    indent +
    cidr +
    "</td>\n" +
    '  <td class="row_range text-muted font-monospace">' +
    rangeStr +
    "</td>\n" +
    '  <td class="row_usable text-muted fst-italic">Consolidated Parent</td>\n' +
    '  <td class="row_hosts text-muted">' +
    hostStr +
    "</td>\n" +
    '  <td class="note text-muted fst-italic">(Subnet Group Header)</td>\n' +
    '  <td colspan="' +
    (maxDepth > 0 ? maxDepth + 1 : 2) +
    '" class="text-muted text-center small bg-light-subtle"><span>/' +
    netSize +
    "</span></td>\n" +
    "</tr>\n";
  $("#calcbody").append(parentRow);
}

function exportConfig(isMinified = true) {
  const baseNetwork = Object.keys(subnetMap)[0];
  const miniSubnetMap = {};
  subnetMap = sortIPCIDRs(subnetMap);
  if (isMinified) {
    minifySubnetMap(miniSubnetMap, subnetMap, baseNetwork);
  }
  if (operatingMode !== "Standard") {
    const config = {
      config_version: configVersion,
      operating_mode: operatingMode,
    };
    if (ipVersion === "IPv6") {
      config.ip_version = "IPv6";
    }
    config.base_network = baseNetwork;
    config.subnets = isMinified ? miniSubnetMap : subnetMap;
    return config;
  } else {
    const config = {
      config_version: configVersion,
    };
    if (ipVersion === "IPv6") {
      config.ip_version = "IPv6";
    }
    config.base_network = baseNetwork;
    config.subnets = isMinified ? miniSubnetMap : subnetMap;
    return config;
  }
}

function getConfigUrl() {
  const defaultExport = JSON.parse(JSON.stringify(exportConfig(true)));
  renameKey(defaultExport, "config_version", "v");
  renameKey(defaultExport, "base_network", "b");
  if (Object.prototype.hasOwnProperty.call(defaultExport, "operating_mode")) {
    renameKey(defaultExport, "operating_mode", "m");
  }
  if (Object.prototype.hasOwnProperty.call(defaultExport, "ip_version")) {
    renameKey(defaultExport, "ip_version", "ipv");
  }
  renameKey(defaultExport, "subnets", "s");

  let basePath = window.location.pathname || "/index.html";
  if (basePath.endsWith("/")) {
    basePath += "index.html";
  } else if (!basePath.endsWith(".html")) {
    basePath += "/index.html";
  }

  return (
    basePath +
    "?c=" +
    urlVersion +
    LZString.compressToEncodedURIComponent(JSON.stringify(defaultExport))
  );
}

function processConfigUrl() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  if (params["network"] !== null && params["mask"] !== null) {
    const net = params["network"].trim();
    const mask = parseInt(params["mask"].trim(), 10);
    if (!isNaN(mask)) {
      if (params["ipv"] === "6" || net.includes(":")) {
        switchIpVersion("IPv6");
      } else if (ipVersion !== "IPv4") {
        switchIpVersion("IPv4");
      }

      $("#network").val(net);
      $("#netsize").val(mask);
      maxNetSize = mask;

      if (params["mode"]) {
        const modeVal = params["mode"].toUpperCase();
        if (["STANDARD", "AWS", "AZURE", "GCP", "OCI"].includes(modeVal)) {
          operatingMode = modeVal === "STANDARD" ? "Standard" : modeVal;
          $(
            "#dropdown_standard, #dropdown_aws, #dropdown_azure, #dropdown_gcp, #dropdown_oci",
          ).removeClass("active");
          $("#dropdown_" + operatingMode.toLowerCase()).addClass("active");
          set_usable_ips_title(operatingMode);
        }
      }

      if (params["parent_headers"] === "1") {
        showParentHeaders = true;
        $("#parent_headers_text").text("Hide Parent Headers");
        $("#toggle_parent_headers").addClass("active");
      }

      if (params["division"]) {
        subnetMap = decodeDivisionTree(net, mask, params["division"]);
      } else {
        subnetMap = {};
        const rootNet =
          ipVersion === "IPv6"
            ? getIpv6Network(net, mask)
            : get_network(net, mask);
        subnetMap[rootNet + "/" + mask] = {};
      }

      if (params["meta"]) {
        try {
          const metaObj = JSON.parse(
            LZString.decompressFromEncodedURIComponent(params["meta"]),
          );
          applyNotesAndColors(subnetMap, metaObj);
        } catch (e) {
          console.warn("Could not parse meta param:", e);
        }
      }

      renderTable(operatingMode);
      updateRfc1918Indicator();
      return true;
    }
  }

  if (params["c"] !== null) {
    const urlData = params["c"].substring(1);
    const urlConfig = JSON.parse(
      LZString.decompressFromEncodedURIComponent(urlData),
    );
    renameKey(urlConfig, "v", "config_version");
    if (Object.prototype.hasOwnProperty.call(urlConfig, "m")) {
      renameKey(urlConfig, "m", "operating_mode");
    }
    if (Object.prototype.hasOwnProperty.call(urlConfig, "ipv")) {
      renameKey(urlConfig, "ipv", "ip_version");
    }
    renameKey(urlConfig, "s", "subnets");
    if (urlConfig["config_version"] === "1") {
      expandKeys(urlConfig["subnets"]);
    } else if (urlConfig["config_version"] === "2") {
      if (Object.prototype.hasOwnProperty.call(urlConfig, "b")) {
        renameKey(urlConfig, "b", "base_network");
      }
      const expandedSubnetMap = {};
      expandSubnetMap(
        expandedSubnetMap,
        urlConfig["subnets"],
        urlConfig["base_network"],
      );
      urlConfig["subnets"] = expandedSubnetMap;
    }
    importConfig(urlConfig);
    return true;
  }
  return false;
}

function minifySubnetMap(minifiedMap, referenceMap, baseNetwork) {
  for (const subnet in referenceMap) {
    if (subnet.startsWith("_")) continue;

    const nthRepresentation = getNthSubnet(baseNetwork, subnet);
    minifiedMap[nthRepresentation] = {};
    if (Object.prototype.hasOwnProperty.call(referenceMap[subnet], "_note")) {
      minifiedMap[nthRepresentation]["n"] = referenceMap[subnet]["_note"];
    }
    if (Object.prototype.hasOwnProperty.call(referenceMap[subnet], "_color")) {
      minifiedMap[nthRepresentation]["c"] = referenceMap[subnet]["_color"];
    }
    if (Object.keys(referenceMap[subnet]).some((key) => !key.startsWith("_"))) {
      minifySubnetMap(
        minifiedMap[nthRepresentation],
        referenceMap[subnet],
        baseNetwork,
      );
    }
  }
}

function expandSubnetMap(expandedMap, miniMap, baseNetwork) {
  for (const mapKey in miniMap) {
    if (mapKey === "n" || mapKey === "c") {
      continue;
    }
    const subnetKey = getSubnetFromNth(baseNetwork, mapKey);
    expandedMap[subnetKey] = {};
    if (has_network_sub_keys(miniMap[mapKey])) {
      expandSubnetMap(expandedMap[subnetKey], miniMap[mapKey], baseNetwork);
    } else {
      if (Object.prototype.hasOwnProperty.call(miniMap[mapKey], "n")) {
        expandedMap[subnetKey]["_note"] = miniMap[mapKey]["n"];
      }
      if (Object.prototype.hasOwnProperty.call(miniMap[mapKey], "c")) {
        expandedMap[subnetKey]["_color"] = miniMap[mapKey]["c"];
      }
    }
  }
}

function expandKeys(subnetTree) {
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
      expandKeys(subnetTree[mapKey]);
    } else {
      if (Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_n")) {
        renameKey(subnetTree[mapKey], "_n", "_note");
      }
      if (Object.prototype.hasOwnProperty.call(subnetTree[mapKey], "_c")) {
        renameKey(subnetTree[mapKey], "_c", "_color");
      }
    }
  }
}

function renameKey(obj, oldKey, newKey) {
  if (oldKey !== newKey && Object.prototype.hasOwnProperty.call(obj, oldKey)) {
    Object.defineProperty(
      obj,
      newKey,
      Object.getOwnPropertyDescriptor(obj, oldKey),
    );
    delete obj[oldKey];
  }
}

function importConfig(text) {
  let subnetNet = "10.0.0.0";
  let subnetSize = "16";
  if (text["config_version"] === "1") {
    [subnetNet, subnetSize] = Object.keys(text["subnets"])[0].split("/");
  } else if (text["config_version"] === "2" && text["base_network"]) {
    [subnetNet, subnetSize] = text["base_network"].split("/");
  }
  const targetIpVersion =
    text["ip_version"] || (subnetNet.includes(":") ? "IPv6" : "IPv4");
  if (targetIpVersion !== ipVersion) {
    switchIpVersion(targetIpVersion);
  }
  $("#network").val(subnetNet);
  $("#netsize").val(subnetSize);
  if (ipVersion === "IPv6") {
    updateActiveIpv6Preset(subnetSize);
  } else {
    updateActiveIpv4Preset(subnetSize);
  }
  maxNetSize = parseInt(subnetSize, 10);
  subnetMap = sortIPCIDRs(text["subnets"] || {});
  operatingMode = text["operating_mode"] || "Standard";
  switchMode(operatingMode);
  renderTable(operatingMode);
}

function sortIPCIDRs(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (Object.keys(obj).length === 0) {
    return {};
  }

  const entries = Object.entries(obj);
  const cidrEntries = entries.filter(([key]) => !key.startsWith("_"));
  const metadataEntries = entries.filter(([key]) => key.startsWith("_"));

  const sortedCIDREntries = cidrEntries.sort((a, b) => {
    const netA = a[0].split("/")[0];
    const netB = b[0].split("/")[0];
    const isIpv6A = netA.includes(":");
    const isIpv6B = netB.includes(":");

    if (isIpv6A && isIpv6B) {
      const intA = parseIpv6(netA);
      const intB = parseIpv6(netB);
      if (intA < intB) return -1;
      if (intA > intB) return 1;
      const sizeA = parseInt(a[0].split("/")[1], 10);
      const sizeB = parseInt(b[0].split("/")[1], 10);
      return sizeA - sizeB;
    }

    const ipA = netA.split(".").map(Number);
    const ipB = netB.split(".").map(Number);

    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) {
        return ipA[i] - ipB[i];
      }
    }
    const sizeA = parseInt(a[0].split("/")[1], 10);
    const sizeB = parseInt(b[0].split("/")[1], 10);
    return sizeA - sizeB;
  });

  const sortedObj = {};

  for (const [key, value] of sortedCIDREntries) {
    sortedObj[key] = typeof value === "object" ? sortIPCIDRs(value) : value;
  }

  for (const [key, value] of metadataEntries) {
    sortedObj[key] = value;
  }

  return sortedObj;
}

const rgba2hex = (rgba) => {
  if (!rgba) return "";
  if (rgba.startsWith("#")) return rgba;
  const match = rgba.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
  );
  if (!match) return rgba;
  return `#${match
    .slice(1)
    .map((n, i) =>
      n === undefined
        ? ""
        : (i === 3 ? Math.round(parseFloat(n) * 255) : parseInt(n, 10))
            .toString(16)
            .padStart(2, "0"),
    )
    .join("")}`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Theme Toggle System (ns1.orion.net.id style)
   ═══════════════════════════════════════════════════════════════════════════ */
(function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  function updateIcon(t) {
    const icon = document.getElementById("themeIcon");
    const toggle = document.getElementById("themeToggle");
    if (!icon) return;
    if (t === "dark") {
      // In dark mode: Show Font Awesome regular sun icon with tooltip to switch to light mode
      icon.className = "fa-regular fa-sun";
      if (toggle) {
        toggle.setAttribute("title", "Switch to Light Mode");
        toggle.setAttribute("aria-label", "Switch to Light Mode");
      }
    } else {
      // In light mode: Show Font Awesome regular moon icon with tooltip to switch to dark mode
      icon.className = "fa-regular fa-moon";
      if (toggle) {
        toggle.setAttribute("title", "Switch to Dark Mode");
        toggle.setAttribute("aria-label", "Switch to Dark Mode");
      }
    }
  }

  function getSystemTheme() {
    try {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  }

  function updateThemeColor(t) {
    try {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", t === "dark" ? "#0f172a" : "#ffffff");
      }
    } catch (e) {}
  }

  function applyTheme(t, persist) {
    if (t !== "dark" && t !== "light") {
      t = "dark";
    }
    root.setAttribute("data-theme", t);
    root.setAttribute("data-bs-theme", t);
    if (persist) {
      try {
        localStorage.setItem("site-theme", t);
        localStorage.setItem("theme", t);
      } catch (e) {}
    }
    updateIcon(t);
    updateThemeColor(t);
  }

  function getStoredTheme() {
    try {
      const s =
        localStorage.getItem("site-theme") || localStorage.getItem("theme");
      if (s === "dark" || s === "light") return s;
    } catch (e) {}
    return null;
  }

  const storedTheme = getStoredTheme();
  const initial = storedTheme || "dark";
  applyTheme(initial, Boolean(storedTheme));

  if (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const cur = root.getAttribute("data-theme") || "light";
      const next = cur === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }
})();

/**
 * Dynamic Visitor Counter connected to counter.txt
 * Tracks visits dynamically and synchronizes with counter.txt baseline
 */
(function initVisitorCounter() {
  const counterVal = document.getElementById("visitor_count_val");
  const counterBtn = document.getElementById("visitor_counter_btn");
  if (!counterVal) return;

  const COOKIE_VISIT_15M = "vsc_visitor_15m_session";
  const LOCAL_VISIT_OFFSET_KEY = "vsc_visitor_local_offset";

  let isNewVisit = false;
  try {
    if (typeof TemporaryCookieStore !== "undefined") {
      const existingSession = TemporaryCookieStore.get(COOKIE_VISIT_15M);
      if (!existingSession) {
        TemporaryCookieStore.set(COOKIE_VISIT_15M, Date.now().toString(), 900); // 15 mins (RFC 6265)
        isNewVisit = true;
      }
    } else {
      if (!sessionStorage.getItem("vsc_visitor_session_recorded")) {
        sessionStorage.setItem("vsc_visitor_session_recorded", "1");
        isNewVisit = true;
      }
    }
  } catch (e) {}

  let localOffset = 0;
  try {
    localOffset = parseInt(
      localStorage.getItem(LOCAL_VISIT_OFFSET_KEY) || "0",
      10,
    );
    if (isNaN(localOffset)) localOffset = 0;
    if (isNewVisit) {
      localOffset += 1;
      localStorage.setItem(LOCAL_VISIT_OFFSET_KEY, localOffset.toString());
    }
  } catch (e) {}

  function formatCount(num) {
    return Number(num).toLocaleString("en-US");
  }

  function fetchCounter() {
    fetch("counter.txt?t=" + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error("counter.txt unavailable");
        return res.text();
      })
      .then(function (text) {
        const fileCount = parseInt(text.trim(), 10);
        if (!isNaN(fileCount)) {
          const total = fileCount + localOffset;
          counterVal.textContent = formatCount(total);
          // If server supports POST to counter.txt, update it
          if (isNewVisit) {
            try {
              fetch("counter.txt", {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: total.toString(),
              }).catch(function () {});
            } catch (e) {}
          }
        } else {
          counterVal.textContent = formatCount(1248 + localOffset);
        }
      })
      .catch(function () {
        counterVal.textContent = formatCount(1248 + localOffset);
      });
  }

  fetchCounter();

  if (counterBtn) {
    counterBtn.addEventListener("click", function () {
      const icon = counterBtn.querySelector("i");
      if (icon) icon.classList.add("fa-spin");
      fetchCounter();
      setTimeout(function () {
        if (icon) icon.classList.remove("fa-spin");
      }, 600);
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   Back to Top Floating Button Controller
   ═══════════════════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btnScrollTop = document.getElementById("btn_scroll_top");
  if (!btnScrollTop) return;

  function handleScroll() {
    const scrollY =
      window.pageYOffset ||
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (scrollY > 120) {
      btnScrollTop.classList.add("show");
    } else {
      btnScrollTop.classList.remove("show");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });
  handleScroll();

  btnScrollTop.addEventListener("click", function (e) {
    e.preventDefault();
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBackToTop);
} else {
  initBackToTop();
}

