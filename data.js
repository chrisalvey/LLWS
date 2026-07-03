// ============================================================================
// LLWS 2026 Participant Tracker — Tournament Data
//
// This is the only file you should need to edit as the tournament progresses.
// index.html reads everything from here and renders it automatically.
//
// HOW TO UPDATE DURING THE TOURNAMENT:
//   1. Set TOURNAMENT.lastUpdated to a human-readable timestamp.
//   2. When a game is played, push a new object onto `games` (most recent
//      games can go anywhere — the page sorts them by `order`).
//   3. Update the matching region(s) in `teamStatus`: bump `record`, and set
//      `bracket` to reflect where that region stands (see the enum below).
//   4. Standings, participant status, the championship spotlight, and the
//      stats section are all computed automatically from `teamStatus` and
//      `games` — you should not need to touch index.html.
// ============================================================================

const TOURNAMENT = {
    year: 2026,
    location: 'Williamsport, PA',
    dates: 'August 19 - 30, 2026',
    lastUpdated: 'Draft complete - July 3, 2026'
};

// Each participant drafted one US region and one International region.
const participants = [
    { name: 'Chris',   usTeam: 'GREAT LAKES',   intlTeam: 'PUERTO RICO' },
    { name: 'Ellie',   usTeam: 'SOUTHEAST',     intlTeam: 'LATIN AMERICA' },
    { name: 'Joe',     usTeam: 'NEW ENGLAND',   intlTeam: 'JAPAN' },
    { name: 'Judy',    usTeam: 'WEST',          intlTeam: 'EUROPE-AFRICA' },
    { name: 'Julie',   usTeam: 'METRO',         intlTeam: 'MEXICO' },
    { name: 'Kelly',   usTeam: 'NORTHWEST',     intlTeam: 'CANADA' },
    { name: 'Lindsey', usTeam: 'SOUTHWEST',     intlTeam: 'ASIA-PACIFIC' },
    { name: 'Lucy',    usTeam: 'MIDWEST',       intlTeam: 'CARIBBEAN' },
    { name: 'Randy',   usTeam: 'MID-ATLANTIC',  intlTeam: 'AUSTRALIA' },
    { name: 'Ryan',    usTeam: 'MOUNTAIN',      intlTeam: 'PANAMA' }
];

// bracket values: 'Active' (still in pool play / bracket, no elimination risk yet),
// 'Elimination' (one loss away from being out), 'Championship' (in the LLWS final),
// 'Winner' (won it all), 'ELIMINATED' (done).
const teamStatus = {
    'WEST':          { record: '0-0', bracket: 'Active' },
    'NORTHWEST':     { record: '0-0', bracket: 'Active' },
    'MIDWEST':       { record: '0-0', bracket: 'Active' },
    'NEW ENGLAND':   { record: '0-0', bracket: 'Active' },
    'MID-ATLANTIC':  { record: '0-0', bracket: 'Active' },
    'METRO':         { record: '0-0', bracket: 'Active' },
    'SOUTHEAST':     { record: '0-0', bracket: 'Active' },
    'GREAT LAKES':   { record: '0-0', bracket: 'Active' },
    'SOUTHWEST':     { record: '0-0', bracket: 'Active' },
    'MOUNTAIN':      { record: '0-0', bracket: 'Active' },
    'CARIBBEAN':     { record: '0-0', bracket: 'Active' },
    'PANAMA':        { record: '0-0', bracket: 'Active' },
    'AUSTRALIA':     { record: '0-0', bracket: 'Active' },
    'LATIN AMERICA': { record: '0-0', bracket: 'Active' },
    'MEXICO':        { record: '0-0', bracket: 'Active' },
    'ASIA-PACIFIC':  { record: '0-0', bracket: 'Active' },
    'EUROPE-AFRICA': { record: '0-0', bracket: 'Active' },
    'PUERTO RICO':   { record: '0-0', bracket: 'Active' },
    'JAPAN':         { record: '0-0', bracket: 'Active' },
    'CANADA':        { record: '0-0', bracket: 'Active' }
};

// Purely decorative emoji per region, used on cards and the spotlight banner.
const regionEmoji = {
    'WEST': '🌅', 'NORTHWEST': '🌲', 'MIDWEST': '🌾', 'NEW ENGLAND': '🦞',
    'MID-ATLANTIC': '🗽', 'METRO': '🏙️', 'SOUTHEAST': '🌴', 'GREAT LAKES': '🌊',
    'SOUTHWEST': '🌵', 'MOUNTAIN': '🏔️',
    'CARIBBEAN': '🏝️', 'PANAMA': '🚢', 'AUSTRALIA': '🦘', 'LATIN AMERICA': '🌎',
    'MEXICO': '🇲🇽', 'ASIA-PACIFIC': '🌏', 'EUROPE-AFRICA': '🌍', 'PUERTO RICO': '🐸',
    'JAPAN': '🗾', 'CANADA': '🍁'
};

// Completed games, in the order you want them to appear (most recent first
// is easiest, but the page will not re-sort them for you).
// gameType suggestions: 'Pool Play', 'US Elimination', 'International Elimination',
// 'US Championship Game', 'International Championship Game', 'LLWS Championship'.
const games = [
    // Example (delete once real games start):
    // {
    //     date: 'Wed, Aug 19 - 1:00 PM CT',
    //     game: 'Game 1',
    //     team1: 'GREAT LAKES', team1Score: 5,
    //     team2: 'MOUNTAIN', team2Score: 2,
    //     gameType: 'Pool Play',
    //     winner: 'GREAT LAKES'
    // },
];

// Optional free-text callouts shown near the top of the page (e.g. big upsets,
// rainouts, reschedules). Leave empty for none.
const notes = [];
