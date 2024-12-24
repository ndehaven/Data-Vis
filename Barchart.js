document.addEventListener("DOMContentLoaded", function () {
	const margin = { top: 20, right: 30, bottom: 60, left: 60 };
	let width = 1200 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	const svgContainer = d3.select("#barChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	const svg = svgContainer
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const dropdown = d3.select("#yearDropdown");

	d3.csv("CSVs/LES1252881600Q.csv").then(data => {
		data.forEach(d => {
			d.date = new Date(d.DATE);
			d.earnings = +d["LES1252881600Q"];
		});

		const years = Array.from(new Set(data.map(d => d.date.getFullYear())));
		years.sort((a, b) => a - b);
		years.forEach(year => {
			dropdown.append("option")
				.attr("value", year)
				.text(year);
		});

		dropdown.append("option")
			.attr("value", "all")
			.text("All Years")
			.property("selected", true);

		const defaultData = data.filter(d => d.date.getFullYear() >= 1978 && d.date.getFullYear() <= 2024);

		const x = d3.scaleBand()
			.range([0, width])
			.padding(0.2);

		const y = d3.scaleLinear()
			.range([height, 0]);

		const tooltip = d3.select("body").append("div")
			.attr("id", "tooltip")
			.style("position", "absolute")
			.style("background", "#333")
			.style("color", "#fff")
			.style("padding", "5px")
			.style("border-radius", "5px")
			.style("font-size", "14px")
			.style("pointer-events", "none")
			.style("display", "none");

		function updateChart(filteredData) {
			const selectedYear = dropdown.property("value");
			const numBars = filteredData.length;
			const barChartSvg = document.getElementById("barChart");

			if (selectedYear === "all") {
				width = 1200 - margin.left - margin.right;
				barChartSvg.style.minWidth = "1200px";
			} else {
				width = Math.max(300, numBars * 50);
				barChartSvg.style.minWidth = "500px";
			}

			svgContainer
				.attr("width", width + margin.left + margin.right);

			x.range([0, width]).domain(filteredData.map(d => d3.timeFormat("%Y-%m")(d.date)));
			y.domain([0, d3.max(filteredData, d => d.earnings)]).nice();

			svg.selectAll(".bar").remove();
			svg.selectAll(".axis").remove();

			svg.append("g")
				.attr("class", "axis")
				.attr("transform", `translate(0,${height})`)
				.call(d3.axisBottom(x)
					.tickValues(x.domain().filter((_, i) => !(i % Math.ceil(filteredData.length / 12)))),
				)
				.selectAll("text")
				.attr("transform", "rotate(-45)")
				.style("text-anchor", "end");

			svg.append("g")
				.attr("class", "axis")
				.call(d3.axisLeft(y));

			svg.selectAll(".bar")
				.data(filteredData)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", d => x(d3.timeFormat("%Y-%m")(d.date)))
				.attr("y", height)
				.attr("width", x.bandwidth())
				.attr("height", 0)
				.attr("fill", "#69b3a2")
				.on("mouseover", function (event, d) {
					d3.select(this).attr("fill", "orange");
					tooltip
						.style("left", `${event.pageX + 10}px`)
						.style("top", `${event.pageY - 20}px`)
						.style("display", "inline-block")
						.html(`Earnings: $${d.earnings}<br>Date: ${d3.timeFormat("%Y-%m")(d.date)}`);
				})
				.on("mouseout", function () {
					d3.select(this).attr("fill", "#69b3a2");
					tooltip.style("display", "none");
				})
				.transition()
				.duration(800)
				.attr("y", d => y(d.earnings))
				.attr("height", d => height - y(d.earnings));
		}

		updateChart(defaultData);

		dropdown.on("change", function () {
			const selectedYear = d3.select(this).property("value");
			const filtered = selectedYear === "all"
				? defaultData
				: data.filter(d => d.date.getFullYear() == selectedYear);
			updateChart(filtered);
		});
	}).catch(error => console.error("Error loading the CSV data:", error));
});
