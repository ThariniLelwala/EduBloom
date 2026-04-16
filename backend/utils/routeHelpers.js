// utils/routeHelpers.js

/**
 * Extract ID from path by position
 * Example: /api/teacher/subjects/123 -> position 4 = "123"
 */
function getId(pathname, position) {
  return pathname.split("/")[position];
}

/**
 * Check exact path match (handles trailing slash)
 * Example: isPath("/api/teacher/profile", "/api/teacher/profile") = true
 */
function isPath(pathname, path) {
  return pathname === path || pathname === path + "/";
}

/**
 * Match path with a single ID parameter
 * Example: matches("/api/teacher/subjects/\\d+")("/api/teacher/subjects/123") = true
 */
function matches(pattern) {
  return (pathname) => new RegExp(`^${pattern}$`).test(pathname);
}

module.exports = { getId, isPath, matches };