process.traceDeprecation = true;
const mf_config = require("@patternslib/dev/webpack/webpack.mf");
const package_json = require("./package.json");
const package_json_mockup = require("@plone/mockup/package.json");
const package_json_patternslib = require("@patternslib/patternslib/package.json");
const path = require("path");
const webpack_config = require("@patternslib/dev/webpack/webpack.config").config;

module.exports = () => {
    let config = {
        entry: {
            "blicca.staticresourceoverride.min": path.resolve(
                __dirname,
                "resources/index.js"
            ),
        },
    };

    config = webpack_config({
        config: config,
        package_json: package_json,
    });

    // Build directly into the static directory of the Python package.
    config.output.path = path.resolve(
        __dirname,
        "src/blicca/staticresourceoverride/static/bundles"
    );

    // Svelte support — analogous to Mockup's webpack.config.js.
    config.module.rules.push({
        test: /\.svelte$/,
        use: {
            loader: "svelte-loader",
            options: {
                compilerOptions: {
                    dev: process.env.NODE_ENV === "development",
                    // Enforce Svelte 5 runes syntax ($props, $state, ...).
                    runes: true,
                },
                emitCss: process.env.NODE_ENV !== "development",
                hotReload: process.env.NODE_ENV === "development",
            },
        },
    });
    config.resolve.extensions = [".js", ".json", ".wasm", ".svelte"];
    config.resolve.mainFields = ["browser", "module", "main"];
    config.resolve.conditionNames = ["svelte", "browser", "require"];

    // Module federation remote: the Plone bundle (Mockup) is the host and
    // loads this bundle on document-ready. Common dependencies (Patternslib,
    // @plone/registry, jQuery, ...) are shared at runtime — this way host
    // and add-on use the SAME pattern and component registries.
    config.plugins.push(
        mf_config({
            name: "blicca.staticresourceoverride",
            filename: "blicca.staticresourceoverride-remote.min.js",
            remote_entry: config.entry["blicca.staticresourceoverride.min"],
            dependencies: {
                ...package_json_patternslib.dependencies,
                ...package_json_mockup.dependencies,
                ...package_json.dependencies,
            },
            shared: {
                // Mirror the host's Svelte shares (mockup webpack.config.js):
                // Svelte keeps its reactivity state in module-level
                // variables, so our compiled components must run on the
                // very same runtime instance as the Plone bundle. The
                // prefix share ("svelte/") covers the subpath imports of
                // compiled components, such as "svelte/internal/client".
                svelte: {
                    singleton: true,
                    requiredVersion: package_json.dependencies["svelte"],
                },
                "svelte/": {
                    singleton: true,
                    requiredVersion: package_json.dependencies["svelte"],
                },
            },
        })
    );

    if (process.env.NODE_ENV === "development") {
        config.devServer.port = "3001";
        config.devServer.static.directory = path.resolve(__dirname, "./resources/");
    }

    return config;
};
