document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get("topic");

    if (!topic) {
        document.getElementById("selected-topic").textContent = "No Topic Selected";
        return;
    }

    document.getElementById("selected-topic").textContent = topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' ');

    // Fetch and display all resources
    await fetchResources(topic);
});

// Function to fetch courses, videos, projects, and practice problems from the API
async function fetchResources(topic) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses?topic=${topic}`);
        const data = await response.json();
        const resourceList = document.getElementById("resource-list");
        resourceList.innerHTML = ""; // Clear previous content

        if (!data.resources || data.resources.length === 0) {
            resourceList.innerHTML = "<p>No resources found for this topic.</p>";
            return;
        }

        // Group resources into categories
        const categories = {
            "Courses": [],
            "Websites": [],
            "YouTube Videos": [],
            "Practice Problems": [],
            "Projects": [],
            "Apps/Websites": []
        };

        data.resources.forEach((resource) => {
            let categoryKey;
            if (resource.type === "Course") categoryKey = "Courses";
            else if (resource.type === "Website") categoryKey = "Websites";
            else if (resource.type === "Video") categoryKey = "YouTube Videos";
            else if (resource.type === "Practice") categoryKey = "Practice Problems";
            else if (resource.type === "Project") categoryKey = "Projects";
            else if (resource.type === "App" || resource.type === "Learning") categoryKey = "Apps/Websites";

            if (categoryKey) {
                categories[categoryKey].push(`<li><a href="${resource.link}" target="_blank">${resource.title}</a></li>`);
            }
        });

        // Render sections as dropdowns
        Object.keys(categories).forEach((category) => {
            if (categories[category].length > 0) {
                resourceList.innerHTML += `
                    <details>
                        <summary><b>${category}</b></summary>
                        <ul>${categories[category].join("")}</ul>
                    </details>
                `;
            }
        });

    } catch (error) {
        console.error("Failed to fetch resources:", error);
        document.getElementById("resource-list").innerHTML = "<p>Error loading resources.</p>";
    }
}



