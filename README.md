🥗 Calorie Calculator

A sleek, interactive React + Vite web app that helps users calculate their caloric needs, BMI, and body classification with live feedback and a modern glass-inspired design.

⸻

🚀 Features
	•	Real-time calorie calculation based on user input (age, weight, height, and activity level)
	•	BMI calculator with an animated gradient scale showing Underweight, Normal, and Overweight zones
	•	Unit switching between pounds/inches and kilograms/centimeters
	•	Responsive design that looks great on desktop and mobile
	•	Smooth fade-in animations for a polished user experience

⸻

🧩 Tech Stack
	•	React (Vite) — lightning-fast development setup
	•	CSS3 / Flexbox / Grid — for a clean, modern layout
	•	JavaScript (ESNext) — pure logic for BMI and calorie calculations
	•	Responsive UI — built with adaptive sizing and clean visuals

⸻

🧮 Formula References

BMI (Body Mass Index)

BMI = weight(kg) / [height(m)]²

Calorie Needs (Mifflin–St Jeor Equation)

Men:    BMR = 10W + 6.25H - 5A + 5
Women:  BMR = 10W + 6.25H - 5A - 161

Then multiply BMR by activity level to get TDEE.

⸻

🖥️ Development

Install Dependencies

npm install

Run the App

npm run dev

Build for Production

npm run build


⸻

📂 Project Structure

📦 CalorieCalculator
 ┣ 📂 src
 ┃ ┣ 📜 App.jsx         → Main logic + components
 ┃ ┣ 📜 App.css         → Core styling and animations
 ┃ ┣ 📜 main.jsx        → React entry point
 ┃ ┗ 📂 assets          → Icons, images, etc.
 ┣ 📜 index.html        → Base HTML file
 ┣ 📜 vite.config.js    → Vite configuration
 ┣ 📜 package.json      → Dependencies and scripts
 ┗ 📜 README.md         → Project overview (this file)


⸻

🎨 Design
	•	Glassmorphism aesthetic with soft shadows and gradients
	•	3-color BMI gradient scale: Blue → White → Red
	•	Animated marker indicating user BMI position

⸻

🤝 Contributing

Feel free to fork, enhance, and submit pull requests. Any improvements to the BMI visualization, UX, or performance are welcome!

⸻

📜 License

MIT License — free to use, modify, and distribute.
