const { createClient } = supabase;
const supaUrl = 'https://mhoixsqyuksstwmrykeo.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2l4c3F5dWtzc3R3bXJ5a2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NDc5NTIsImV4cCI6MjAyNDUyMzk1Mn0.2ThgHRyPdf_rSrPCvB8g73GJiqUSEJ58pmFr6TDuICk';
const db = createClient(supaUrl, supaAnonKey);
fetchRaceData(2020);

async function fetchRaceData(year) {
// uses the same API as the Node examples
const { data, error } = await db.from('races')
.select('*')
.eq('year',year)
.order('round', { ascending: true });;
if (error) {
console.error('Error fetching data:', error);
return;
}
// populate first unordered list
const first = document.querySelector("#first");
for (let d of data) {
const li = document.createElement("li");
li.textContent = d.name;
li.value = d.raceId;
first.appendChild(li);
}
}