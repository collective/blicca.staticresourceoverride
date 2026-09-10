// Webpack entry point for module federation.
// The dynamic import (keep the brackets!) creates a split point so that
// webpack can negotiate the shared dependencies (Patternslib,
// @plone/registry, jQuery, ...) with the Plone bundle at runtime BEFORE our
// code runs.
//
// The import promise is exported as default: the module federation helper
// of the Plone bundle can wait for it, so that the Patternslib registry
// only scans the DOM once our patterns and components are registered.
export default import("./overrides");
