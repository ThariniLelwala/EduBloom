// Example: Inject row + handle view button click
const tableBody = document.querySelector("#userTable tbody");
const contentDetails = document.getElementById("contentDetails");
const contentText = document.getElementById("contentText");

// Dummy data
const flaggedContents = [
  { id: 1, author: "John", forumId: 23, flaggedBy: "Lina",type:"Misinformation", reason: "Inappropriate content", text: "Example flagged post text..." },
  { id: 2, author: "Amy", forumId: 45, flaggedBy: "Ben",type:"Plagarism", reason: "Spam", text: "This is a spam post..." },
];

// Load rows
flaggedContents.forEach(c => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${c.id}</td>
    <td>${c.author}</td>
    <td>${c.forumId}</td>
    <td>${c.flaggedBy}</td>
    <td>${c.type}</td>
    <td>${c.reason}</td>
    <td><button class="btn-small btn-view" data-id="${c.id}">View</button></td>
  `;
  tableBody.appendChild(tr);
});

// Handle view button
tableBody.addEventListener("click", e => {
  if (e.target.classList.contains("btn-view")) {
    const id = e.target.dataset.id;
    const selected = flaggedContents.find(f => f.id == id);

    contentText.textContent = selected.text;
    contentDetails.style.display = "block";
  }
});
