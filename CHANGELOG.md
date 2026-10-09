# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-09
### Added
- New `keyLower` and `keyUpper` options that allow making lowercase
  and uppercase aliases for the item keys.
- A new test set for the new functionality.
### Changed
- The `findType()` method now supports case-insensitive keys if either of the
  new options is enabled. This may be disabled via the `exact` argument.

## [1.0.1] - 2026-10-01
### Fixed
- An inaccurate test in `cloneElements()` helper function.

## [1.0.0] - 2026-08-05
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.typdef.js/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/supernovus/lum.typdef.js/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/supernovus/lum.typdef.js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/supernovus/lum.typdef.js/releases/tag/v1.0.0

