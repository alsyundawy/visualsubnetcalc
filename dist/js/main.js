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
const urlVersion = "1";
const configVersion = "2";

const netsizePatterns = {
  Standard: "^([12]?[0-9]|3[0-2])$",
  AZURE: "^([12]?[0-9])$",
  AWS: "^(1?[0-9]|2[0-8])$",
  OCI: "^([12]?[0-9]|30)$",
};

const minSubnetSizes = {
  Standard: 32,
  AZURE: 29,
  AWS: 28,
  OCI: 30,
};

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

$("input#network").on("paste", function (e) {
  const clipboardData =
    (e.originalEvent && e.originalEvent.clipboardData) ||
    window.clipboardData ||
    (window.event && window.event.clipboardData);
  if (!clipboardData) return;
  const pastedData = clipboardData.getData("text").trim();
  if (pastedData.includes("/")) {
    const [network, netSize] = pastedData.split("/");
    $("#network").val(network.trim());
    $("#netsize").val(netSize.trim());
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
});

$("#color_palette button").on("click", function () {
  // We don't really NEED to convert this to hex, but it's really low overhead to do the
  // conversion here and saves us space in the export/save
  inflightColor = rgba2hex($(this).css("background-color"));
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
    const configData = JSON.parse(rawVal);
    importConfig(configData);
  } catch (err) {
    show_warning_modal("<div>Please provide a valid JSON configuration!</div>");
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

$("#btn_import_export").on("click", function () {
  $("#importExportArea").val(JSON.stringify(exportConfig(false), null, 2));
});

function reset() {
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
}

function addRowTree(subnetTree, depth, maxDepth, operatingMode) {
  for (const mapKey in subnetTree) {
    if (mapKey.startsWith("_")) {
      continue;
    }
    if (has_network_sub_keys(subnetTree[mapKey])) {
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
  const addressFirst = ip2int(network);
  const addressLast = subnet_last_address(addressFirst, netSize);
  const usableFirst = subnet_usable_first(addressFirst, netSize, operatingMode);
  const usableLast = subnet_usable_last(addressFirst, netSize);
  const hostCount = 1 + usableLast - usableFirst;
  let styleTag = "";
  if (color !== "") {
    styleTag = ' style="background-color: ' + escapeHtml(color) + '"';
  }

  let rangeCol, usableCol;
  if (netSize < 32) {
    rangeCol = int2ip(addressFirst) + " - " + int2ip(addressLast);
    usableCol = int2ip(usableFirst) + " - " + int2ip(usableLast);
  } else {
    rangeCol = int2ip(addressFirst);
    usableCol = int2ip(usableFirst);
  }
  const rowId = "row_" + network.replace(/\./g, "-") + "_" + netSize;
  const rowCIDR = network + "/" + netSize;
  const sanitizedNote = escapeHtml(note);
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
    '" class="split rotate" data-mutate-verb="split"><span>/' +
    netSize +
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
    ip.split(".").reduce(function (ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0
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

  const baseInt = ip2int(baseIp);
  const specificInt = ip2int(specificIp);

  const specificSize = 32 - parseInt(specificMask, 10);
  const offset = specificInt - baseInt;
  const nthSubnet = offset >>> specificSize;

  return `${nthSubnet}${toBase36(parseInt(specificMask, 10))}`;
}

function getSubnetFromNth(baseNetwork, nthString) {
  const [baseIp] = baseNetwork.split("/");
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
      case "OCI":
        return network + 2;
      default:
        return network + 1;
    }
  } else {
    return network;
  }
}

function subnet_usable_last(network, netSize) {
  const last_address = subnet_last_address(network, netSize);
  if (netSize < 31) {
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
  const allKeys = Object.keys(dict);
  for (const i in allKeys) {
    if (
      !allKeys[i].startsWith("_") &&
      allKeys[i] !== "n" &&
      allKeys[i] !== "c"
    ) {
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
      subnetList.push.apply(
        subnetList,
        get_matching_network_list(network, subnetTree[mapKey]),
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
      propValues.push.apply(
        propValues,
        get_property_values(subnetTree[mapKey], property),
      );
    } else {
      propValues.push(subnetTree[mapKey][property] || "");
    }
  }
  return propValues;
}

function get_network(networkInput, netSize) {
  let ipInt = ip2int(networkInput);
  netSize = parseInt(netSize, 10);
  for (let i = 31 - netSize; i >= 0; i--) {
    ipInt &= ~1 << i;
  }
  return int2ip(ipInt);
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
        if (netSize < minSubnetSizes[operatingMode]) {
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
        "#dropdown_standard, #dropdown_azure, #dropdown_aws, #dropdown_oci",
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
    case "OCI":
      $("#useableHeader").html(
        'Usable IPs (<a href="https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet" target="_blank" rel="noopener noreferrer" class="reserved-info-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title="OCI reserves 3 addresses in each subnet for platform use.<br/>Click to navigate to the OCI documentation.">OCI</a>)',
      );
      break;
    default:
      $("#useableHeader").html("Usable IPs");
      break;
  }
  $('[data-bs-toggle="tooltip"]').tooltip();
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
          bootstrap.Tooltip.getInstance(element).setContent({
            ".tooltip-inner": error[0].innerHTML,
          });
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
    reset();
  }
});

function exportConfig(isMinified = true) {
  const baseNetwork = Object.keys(subnetMap)[0];
  const miniSubnetMap = {};
  subnetMap = sortIPCIDRs(subnetMap);
  if (isMinified) {
    minifySubnetMap(miniSubnetMap, subnetMap, baseNetwork);
  }
  if (operatingMode !== "Standard") {
    return {
      config_version: configVersion,
      operating_mode: operatingMode,
      base_network: baseNetwork,
      subnets: isMinified ? miniSubnetMap : subnetMap,
    };
  } else {
    return {
      config_version: configVersion,
      base_network: baseNetwork,
      subnets: isMinified ? miniSubnetMap : subnetMap,
    };
  }
}

function getConfigUrl() {
  const defaultExport = JSON.parse(JSON.stringify(exportConfig(true)));
  renameKey(defaultExport, "config_version", "v");
  renameKey(defaultExport, "base_network", "b");
  if (Object.prototype.hasOwnProperty.call(defaultExport, "operating_mode")) {
    renameKey(defaultExport, "operating_mode", "m");
  }
  renameKey(defaultExport, "subnets", "s");
  return (
    "/index.html?c=" +
    urlVersion +
    LZString.compressToEncodedURIComponent(JSON.stringify(defaultExport))
  );
}

function processConfigUrl() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  if (params["c"] !== null) {
    const urlData = params["c"].substring(1);
    const urlConfig = JSON.parse(
      LZString.decompressFromEncodedURIComponent(urlData),
    );
    renameKey(urlConfig, "v", "config_version");
    if (Object.prototype.hasOwnProperty.call(urlConfig, "m")) {
      renameKey(urlConfig, "m", "operating_mode");
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
  $("#network").val(subnetNet);
  $("#netsize").val(subnetSize);
  maxNetSize = parseInt(subnetSize, 10);
  subnetMap = sortIPCIDRs(text["subnets"] || {});
  operatingMode = text["operating_mode"] || "Standard";
  switchMode(operatingMode);
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
    const ipA = a[0].split("/")[0].split(".").map(Number);
    const ipB = b[0].split("/")[0].split(".").map(Number);

    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) {
        return ipA[i] - ipB[i];
      }
    }
    return 0;
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
