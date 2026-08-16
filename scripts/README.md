# Score pipeline

`fetch-scores.ps1` pulls completed games from ESPN's LLWS scoreboard, resolves each
team to our region labels via `region-map.json`, and updates `../data.js`:

- Appends new completed games to `games[]` (deduped by ESPN game id).
- Recomputes each region's win-loss `record` in `teamStatus`.
- **Never touches `bracket`** (Active/Elimination/Championship/Winner/ELIMINATED) -
  that's a real double-elimination bracket judgment call and stays manual.

`games-log.json` is the script's own running log (source of truth for the `games[]`
block it regenerates each run) - don't hand-edit it.

## Region matching

`region-map.json` maps ESPN's `abbrev` code for each team (a stable 2-letter US
state postal code or 3-letter country code, e.g. `TX`, `JPN`, `VEN`) to our 20
region labels. We match on `abbrev` rather than the human-readable `location`
string because ESPN formats `location` inconsistently from game to game -
sometimes the full name ("Clarendon Hills Illinois"), sometimes already
abbreviated ("Las Vegas NV", "Tokyo JPN") - with no reliable pattern, while
`abbrev` is always the short code.

## Before the tournament starts (~early-mid August)

Four international regions - CARIBBEAN, LATIN AMERICA, EUROPE-AFRICA, ASIA-PACIFIC -
are multi-country pools whose actual qualifying country isn't known until regional
qualifiers finish. Once they are, add an entry to `region-map.json`, e.g.:

```json
"VEN": "LATIN AMERICA",
```

Until you do, any game involving that region gets skipped and the team's location
and abbrev code (e.g. "Barquisimeto Venezuela [VEN]") is printed as a warning and
written to `unresolved-teams.json` so it's easy to spot.

## Running it

```powershell
# Today's games
./fetch-scores.ps1

# Backfill/catch up a range
./fetch-scores.ps1 -StartDate 20260819 -EndDate 20260830

# Dry run against a scratch copy (scripts/test-output/) - doesn't touch real files
./fetch-scores.ps1 -StartDate 20260819 -EndDate 20260830 -Test
```

After each real run, review `teamStatus.bracket` values in `../data.js` and update
any that changed (eliminations, championship berths, the winner), then commit/push.
