// start with your seed data
export const posts = [
  { id: 1, title: "Postitus1", body: "Siin on lühikirjeldus postitus 1-le", createdAt: Date.now() },
  { id: 2, title: "Postitus2", body: "Siin on lühikirjeldus postitus 2-le", createdAt: Date.now() },
  { id: 3, title: "Postitus3", body: "Siin on lühikirjeldus postitus 3-le", createdAt: Date.now() },
];

// simple incremental id
let _id = Math.max(...posts.map(p => p.id), 0);
export function nextId() {
  _id += 1;
  return _id;
}