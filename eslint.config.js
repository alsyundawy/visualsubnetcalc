export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/*.min.js",
      "src/certs/**"
    ]
  },
  {
    files: ["dist/js/main.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        location: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        fetch: "readonly",
        $: "readonly",
        jQuery: "readonly",
        bootstrap: "readonly",
        LZString: "readonly",
        BigInt: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  }
];
