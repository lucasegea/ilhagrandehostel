const { isAllowed, parseAllowlist } = await import("../lib/auth-allowlist.ts");

/**
 * M5 allowlist contract test (D-105). Unit-tests the PURE, IO-free auth decision —
 * the unit-testable core both enforcement points share (signIn callback + publish
 * guard). Asserts: allowlisted email passes regardless of case/whitespace, every
 * not-allowed / absent / malformed shape DENIES (fail-clear, never falls open).
 * Run: npx tsx tests/m5-allowlist.mjs
 */

const checks = [];
const ok = (name, cond) => checks.push([name, !!cond]);

const LIST = "ana@hostel.com, Dev@Agency.com";

// --- allow path: present in the list, any case / whitespace ---
ok("exact allowlisted email passes", isAllowed("ana@hostel.com", LIST) === true);
ok("uppercase email matches lowercase entry", isAllowed("ANA@HOSTEL.COM", LIST) === true);
ok("mixed-case email matches mixed-case entry", isAllowed("dev@agency.com", LIST) === true);
ok("surrounding whitespace is trimmed", isAllowed("  ana@hostel.com  ", LIST) === true);
ok("single-entry allowlist allows that entry", isAllowed("ana@hostel.com", "ana@hostel.com") === true);

// --- deny path: not in the list ---
ok("non-allowlisted email denied", isAllowed("intruso@evil.com", LIST) === false);
ok("partial/substring email denied", isAllowed("ana@hostel.co", LIST) === false);

// --- deny path: absent email (fail-clear) ---
ok("null email denied", isAllowed(null, LIST) === false);
ok("undefined email denied", isAllowed(undefined, LIST) === false);
ok("empty-string email denied", isAllowed("", LIST) === false);
ok("whitespace-only email denied", isAllowed("   ", LIST) === false);

// --- deny path: empty / malformed allowlist locks everyone out (never falls open) ---
ok("empty allowlist denies everyone", isAllowed("ana@hostel.com", "") === false);
ok("whitespace-only allowlist denies everyone", isAllowed("ana@hostel.com", "   ") === false);
ok("comma-only allowlist denies everyone", isAllowed("ana@hostel.com", ",,, ,") === false);
// an undefined allowlist would be a type error in TS, but the runtime must still deny:
ok("non-string allowlist denies (runtime guard)", isAllowed("ana@hostel.com", /** @type {any} */ (undefined)) === false);

// --- parseAllowlist normalization ---
ok("parseAllowlist trims+lowercases+drops empties", JSON.stringify(parseAllowlist(" A@b.com ,, C@d.com ")) === JSON.stringify(["a@b.com", "c@d.com"]));
ok("parseAllowlist of empty -> []", parseAllowlist("").length === 0);
ok("parseAllowlist of null -> []", parseAllowlist(null).length === 0);

let pass = true;
for (const [name, good] of checks) {
  console.log(`${good ? "PASS" : "FAIL"}  ${name}`);
  if (!good) pass = false;
}
console.log(`${checks.filter((c) => c[1]).length}/${checks.length} checks passed`);
console.log(pass ? "M5 ALLOWLIST CONTRACT PASS" : "M5 ALLOWLIST CONTRACT FAIL");
process.exit(pass ? 0 : 1);
