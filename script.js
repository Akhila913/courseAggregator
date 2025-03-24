const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());

// Fetch courses from Google Search API (GFG, Udemy, Coursera)
async function fetchGoogleSearchResults(query) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}`;
        const response = await axios.get(url);
        return response.data.items ? response.data.items.map(item => ({
            type: "Course",
            title: item.title,
            link: item.link,
        })) : [];
    } catch (error) {
        console.error("Google Search API error:", error);
        return [];
    }
}

// Fetch YouTube videos
async function fetchYouTubeVideos(query) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${process.env.YOUTUBE_API_KEY}&maxResults=5`;
        const response = await axios.get(url);
        return response.data.items ? response.data.items.map(item => ({
            type: "Video",
            title: item.snippet.title,
            link: `https://www.youtube.com/watch?v=${item.id.videoId}`
        })) : [];
    } catch (error) {
        console.error("YouTube API error:", error);
        return [];
    }
}

// Fetch courses from Coursera API
async function fetchCourseraCourses(query) { 
    try {
        const url = `https://api.coursera.org/api/courses.v1?q=search&query=${query}`;
        const response = await axios.get(url);
        return response.data.elements.map(course => ({
            type: "Course",
            title: course.name,
            link: `https://www.coursera.org/learn/${course.slug}`
        }));
    } catch (error) {
        console.error("Coursera API error:", error);
        return [];
    }
}

// Fetch Udemy courses using Google API
async function fetchUdemyCourses(query) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?q=${query}+site:udemy.com&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}`;
        const response = await axios.get(url);
        return response.data.items.map(item => ({
            type: "Course",
            title: item.title,
            link: item.link
        }));
    } catch (error) {
        console.error("Google Search API error (Udemy):", error);
        return [];
    }
}

// Fetch coding problems from LeetCode
async function fetchLeetCodeProblems(topic) {
    try {
        const url = `https://leetcode.com/api/problems/all/`;
        const response = await axios.get(url);
        return response.data.stat_status_pairs
            .filter(problem => problem.stat.question__title.toLowerCase().includes(topic.toLowerCase()))
            .map(problem => ({
                type: "Practice",
                title: problem.stat.question__title,
                link: `https://leetcode.com/problems/${problem.stat.question__title_slug}/`
            }));
    } catch (error) {
        console.error("LeetCode API error:", error);
        return [];
    }
}

// Fetch best websites for learning a skill
async function fetchBestWebsites(query) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?q=best websites to learn ${query}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}`;
        const response = await axios.get(url);
        return response.data.items ? response.data.items.map(item => ({
            type: "Website",
            title: item.title,
            link: item.link,
        })) : [];
    } catch (error) {
        console.error("Google Search API error:", error);
        return [];
    }
}

// Fetch practice questions from LeetCode, GFG, and Codeforces
async function fetchPracticeQuestions(query) {
    try {
        return [
            { type: "Practice", title: "GeeksforGeeks Practice Problems", link: `https://www.geeksforgeeks.org/?s=${query}+problems` },
            { type: "Practice", title: "LeetCode Problems", link: `https://leetcode.com/problemset/all/?search=${query}` },
            { type: "Practice", title: "Codeforces Problems", link: `https://codeforces.com/problemset?tags=${query}` },
        ];
    } catch (error) {
        console.error("Error fetching practice problems:", error);
        return [];
    }
}

// Fetch coding projects from GitHub
async function fetchGitHubProjects(topic) {
    try {
        const url = `https://api.github.com/search/repositories?q=${topic}+project&sort=stars&order=desc`;
        const response = await axios.get(url);
        return response.data.items.slice(0, 5).map(repo => ({
            type: "Project",
            title: repo.name,
            link: repo.html_url,
        }));
    } catch (error) {
        console.error("GitHub API error:", error);
        return [];
    }
}

// API Endpoint to Fetch All Resources
app.get("/api/courses", async (req, res) => {
    try {
        const topic = req.query.topic;
        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        const [
            googleResults, websites, practiceQuestions, udemyCourses, 
            courseraCourses, leetCodeProblems, gitHubProjects, youTubeVideos
        ] = await Promise.all([
            fetchGoogleSearchResults(`${topic} best courses`),
            fetchBestWebsites(topic),
            fetchPracticeQuestions(topic),
            fetchUdemyCourses(topic),
            fetchCourseraCourses(topic),
            fetchLeetCodeProblems(topic),
            fetchGitHubProjects(topic),
            fetchYouTubeVideos(`${topic} tutorials`)
        ]);

        res.json({ 
            success: true, 
            topic, 
            resources: [
                ...googleResults, 
                ...websites, 
                ...practiceQuestions, 
                ...udemyCourses, 
                ...courseraCourses, 
                ...leetCodeProblems, 
                ...gitHubProjects,
                ...youTubeVideos
            ]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



