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
    lastUpdated: 'Thursday, August 20, 2026 at 8:13 AM (script run)'
};

// Each participant drafted one US region and one International region.
const participants = [
    { name: 'Trimbaths',   usTeam: 'GREAT LAKES',   intlTeam: 'CURAÇAO' },
    { name: 'Ellie',   usTeam: 'SOUTHEAST',     intlTeam: 'LATIN AMERICA' },
    { name: 'Joe',     usTeam: 'NEW ENGLAND',   intlTeam: 'JAPAN' },
    { name: 'Judy',    usTeam: 'WEST',          intlTeam: 'EUROPE-AFRICA' },
    { name: 'Julie',   usTeam: 'METRO',         intlTeam: 'MEXICO' },
    { name: 'Kelly',   usTeam: 'NORTHWEST',     intlTeam: 'CANADA' },
    { name: 'Alveys', usTeam: 'SOUTHWEST',     intlTeam: 'ASIA-PACIFIC' },
    { name: 'Lucy',    usTeam: 'MIDWEST',       intlTeam: 'CARIBBEAN' },
    { name: 'Randy',   usTeam: 'MID-ATLANTIC',  intlTeam: 'AUSTRALIA' },
    { name: 'Ryan',    usTeam: 'MOUNTAIN',      intlTeam: 'PANAMA' }
];

// bracket values: 'Active' (still in pool play / bracket, no elimination risk yet),
// 'Elimination' (one loss away from being out), 'Championship' (in the LLWS final),
// 'Winner' (won it all), 'ELIMINATED' (done).
const teamStatus = {
    'WEST': { record: '0-0', bracket: 'Active' },
    'NORTHWEST': { record: '1-0', bracket: 'Active' },
    'MIDWEST': { record: '0-0', bracket: 'Active' },
    'NEW ENGLAND': { record: '0-1', bracket: 'Active' },
    'MID-ATLANTIC': { record: '0-0', bracket: 'Active' },
    'METRO': { record: '1-0', bracket: 'Active' },
    'SOUTHEAST': { record: '0-1', bracket: 'Active' },
    'GREAT LAKES': { record: '0-0', bracket: 'Active' },
    'SOUTHWEST': { record: '0-0', bracket: 'Active' },
    'MOUNTAIN': { record: '0-0', bracket: 'Active' },
    'CARIBBEAN': { record: '0-1', bracket: 'Active' },
    'PANAMA': { record: '0-0', bracket: 'Active' },
    'AUSTRALIA': { record: '0-0', bracket: 'Active' },
    'LATIN AMERICA': { record: '1-0', bracket: 'Active' },
    'MEXICO': { record: '0-0', bracket: 'Active' },
    'ASIA-PACIFIC': { record: '1-0', bracket: 'Active' },
    'EUROPE-AFRICA': { record: '0-0', bracket: 'Active' },
    'CURAÇAO': { record: '0-0', bracket: 'Active' },
    'JAPAN': { record: '0-0', bracket: 'Active' },
    'CANADA': { record: '0-1', bracket: 'Active' },
};

// Purely decorative emoji per region, used on cards and the spotlight banner.
const regionEmoji = {
    'WEST': '🌅', 'NORTHWEST': '🌲', 'MIDWEST': '🌾', 'NEW ENGLAND': '🦞',
    'MID-ATLANTIC': '🗽', 'METRO': '🏙️', 'SOUTHEAST': '🌴', 'GREAT LAKES': '🌊',
    'SOUTHWEST': '🌵', 'MOUNTAIN': '🏔️',
    'CARIBBEAN': '🏝️', 'PANAMA': '🚢', 'AUSTRALIA': '🦘', 'LATIN AMERICA': '🌎',
    'MEXICO': '🌮', 'ASIA-PACIFIC': '🌏', 'EUROPE-AFRICA': '🌍', 'CURAÇAO': '🦩',
    'JAPAN': '🗾', 'CANADA': '🍁'
};

// Each region's official brand color, scraped from littleleague.org's live
// 2026 bracket page (bracket-matchup__team-name computed text color). Used as
// the team-name pill's background when a team is Active; the pill switches to
// the functional status colors (gray/yellow/gold) for elimination-risk,
// championship, and winner states instead, since those convey game state.
const regionColors = {
    'GREAT LAKES':   { bg: '#2E3E7C', text: '#ffffff' },
    'METRO':         { bg: '#000000', text: '#ffffff' },
    'MID-ATLANTIC':  { bg: '#002D62', text: '#ffffff' },
    'MIDWEST':       { bg: '#005039', text: '#ffffff' },
    'MOUNTAIN':      { bg: '#B8AC82', text: '#212529' },
    'NEW ENGLAND':   { bg: '#860038', text: '#ffffff' },
    'NORTHWEST':     { bg: '#04703C', text: '#ffffff' },
    'SOUTHEAST':     { bg: '#FFC628', text: '#212529' },
    'SOUTHWEST':     { bg: '#EF4523', text: '#ffffff' },
    'WEST':          { bg: '#79BDE8', text: '#212529' },
    'ASIA-PACIFIC':  { bg: '#D3C89F', text: '#212529' },
    'AUSTRALIA':     { bg: '#000000', text: '#ffffff' },
    'CANADA':        { bg: '#DC1E35', text: '#ffffff' },
    'CARIBBEAN':     { bg: '#0793CF', text: '#ffffff' },
    'CURAÇAO':       { bg: '#2C3248', text: '#ffffff' },
    'EUROPE-AFRICA': { bg: '#1D1160', text: '#ffffff' },
    'JAPAN':         { bg: '#9493A2', text: '#212529' },
    'LATIN AMERICA': { bg: '#008C99', text: '#ffffff' },
    'MEXICO':        { bg: '#04703C', text: '#ffffff' },
    'PANAMA':        { bg: '#79BDE8', text: '#212529' }
};

// The specific Little League team representing each region in the 2026 field
// (city, state/country) - shown as a smaller secondary line under the region
// name on the participant dashboard. Source: official 2026 regional/qualifier
// results (littleleague.org, ESPN). Update if a region's actual qualifier
// changes before the tournament starts.
const regionTeamLocation = {
    'GREAT LAKES':   'Hamilton, Ohio',
    'METRO':         'Bayonne, New Jersey',
    'MID-ATLANTIC':  'West Chester, Pennsylvania',
    'MIDWEST':       'Davenport, Iowa',
    'MOUNTAIN':      'Henderson, Nevada',
    'NEW ENGLAND':   'Bridgewater, Massachusetts',
    'NORTHWEST':     'Tacoma, Washington',
    'SOUTHEAST':     'Phenix City, Alabama',
    'SOUTHWEST':     'Boerne, Texas',
    'WEST':          'Bonita, California',
    'JAPAN':         'Tokyo, Japan',
    'MEXICO':        'Tijuana, Baja California',
    'CANADA':        'Vancouver, British Columbia',
    'AUSTRALIA':     'Sydney, New South Wales',
    'PANAMA':        'Chiriquí, Panama',
    'CURAÇAO':       'Willemstad, Curaçao',
    'CARIBBEAN':     'Santiago, Dominican Republic',
    'LATIN AMERICA': 'León, Nicaragua',
    'EUROPE-AFRICA': 'Brno, Czechia',
    'ASIA-PACIFIC':  'Seoul, South Korea'
};

// Completed games, in the order you want them to appear (most recent first
// is easiest, but the page will not re-sort them for you).
// gameType suggestions: 'Pool Play', 'US Elimination', 'International Elimination',
// 'US Championship Game', 'International Championship Game', 'LLWS Championship'.
// team*Hits/team*Errors come from ESPN's box-score line (R/H/E) - use null if
// unavailable, e.g. for a game added/corrected by hand.
const games = [
    { date: 'Wed, Aug 19 - 12:00 PM CT', game: 'Game 1', team1: 'CARIBBEAN', team1Score: 1, team1Hits: 5, team1Errors: 0, team2: 'LATIN AMERICA', team2Score: 2, team2Hits: 4, team2Errors: 0, gameType: 'Opening Round', winner: 'LATIN AMERICA', espnId: '401896651' },
    { date: 'Wed, Aug 19 - 2:00 PM CT', game: 'Game 2', team1: 'SOUTHEAST', team1Score: 0, team1Hits: 1, team1Errors: 3, team2: 'NORTHWEST', team2Score: 2, team2Hits: 3, team2Errors: 1, gameType: 'Opening Round', winner: 'NORTHWEST', espnId: '401896652' },
    { date: 'Wed, Aug 19 - 4:00 PM CT', game: 'Game 3', team1: 'ASIA-PACIFIC', team1Score: 7, team1Hits: 9, team1Errors: 0, team2: 'CANADA', team2Score: 0, team2Hits: 3, team2Errors: 3, gameType: 'Opening Round', winner: 'ASIA-PACIFIC', espnId: '401896856' },
    { date: 'Wed, Aug 19 - 6:00 PM CT', game: 'Game 4', team1: 'METRO', team1Score: 2, team1Hits: 6, team1Errors: 0, team2: 'NEW ENGLAND', team2Score: 1, team2Hits: 4, team2Errors: 2, gameType: 'Opening Round', winner: 'METRO', espnId: '401896857' },
];

// Optional free-text callouts shown near the top of the page (e.g. big upsets,
// rainouts, reschedules). Leave empty for none.
const notes = [];
