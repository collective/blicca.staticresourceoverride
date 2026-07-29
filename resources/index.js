// Webpack entry point for module federation.
// The dynamic import (keep the brackets!) creates a split point so that
// webpack can negotiate the shared dependencies (Patternslib,
// @plone/registry, jQuery, ...) with the Plone bundle at runtime BEFORE our
// code runs.
import("./overrides");
