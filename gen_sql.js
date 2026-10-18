const fs = require("fs");
const excel = ["Aceh Pesisir","Gayo","Alas","Singkil-Subulussalam","Melayu Tamiang","Simeulue","Aneuk Jamee-Kluet","Melayu Sumatera Timur","Batak Toba","Karo","Simalungun","Pakpak-Dairi","Angkola-Mandailing","Pesisir Tapanuli","Nias","Minangkabau","Mentawai","Melayu Riau Pesisir","Melayu Riau Hulu","Melayu Kepulauan Riau","Melayu Natuna-Anambas","Melayu Jambi","Kerinci","Tradisi Rimba Jambi","Melayu Palembang-Musi","Besemah-Lematang","Ogan-Komering","Melayu Bengkulu-Pekal","Rejang-Lembak","Serawai-Kaur","Mukomuko","Enggano","Lampung Pepadun","Lampung Saibatin","Melayu Bangka","Melayu Belitung"];
const excelNamesNormalized = excel.map(n => n.replace(/–/g, "-"));
const dbJSON = fs.readFileSync("sumatra_db.json", "utf8");
const currentGroups = JSON.parse(dbJSON).rows;
const currentNamesNormalized = currentGroups.map(g => g.name.replace(/–/g, "-"));
const toDelete = currentGroups.filter(g => !excelNamesNormalized.includes(g.name.replace(/–/g, "-")));
const toAdd = excel.filter(name => !currentNamesNormalized.includes(name.replace(/–/g, "-")));
let sql = "";
if (toDelete.length > 0) {
  const ids = toDelete.map(g => `'${g.id}'`).join(", ");
  sql += `DELETE FROM region_groups WHERE id IN (${ids});\n`;
}
if (toAdd.length > 0) {
  sql += `DO $$\nDECLARE v_sumatera UUID;\nBEGIN\n  SELECT id INTO v_sumatera FROM region_groups WHERE slug = 'sumatera';\n`;
  toAdd.forEach(name => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    sql += `  INSERT INTO region_groups (name, slug, parent_id) VALUES ('${name.replace(/'/g, "''")}', '${slug}', v_sumatera);\n`;
  });
  sql += `END $$;\n`;
}
fs.writeFileSync("sync_sumatra.sql", sql);
console.log("SQL generated! toAdd:", toAdd, "toDelete:", toDelete.map(g => g.name));
