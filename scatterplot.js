// Dimensions and margins for the scatterplot
const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 500 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append SVG element to the graph3 div
const svg = d3.select("#scatterPlotVis")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the cleaned data from the file
d3.csv("CSVs/cleaned_tableA1.csv").then(data => {
  // Convert data types for numerical fields
  data.forEach(d => {
    d["2022 Median Income"] = +d["2022 Median Income"];
    d["2023 Median Income"] = +d["2023 Median Income"];
    d["2023 Number (thousands)"] = +d["2023 Number (thousands)"];
  });

  // Define the scales based on the data
  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d["2022 Median Income"]) * 0.95, d3.max(data, d => d["2022 Median Income"]) * 1.05])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d["2023 Median Income"]) * 0.95, d3.max(data, d => d["2023 Median Income"]) * 1.05])
    .range([height, 0]);

  // Define color and size scales
  const color = d3.scaleOrdinal()
  .domain(data.map(d => d.Characteristic))
  .range(["#1f77b4", "#ff7f0e"]);
  const size = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d["2023 Number (thousands)"])])
    .range([3, 15]);

  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.bottom)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Median Income (2022)");

  // Y-axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Median Income (2023)");

  // Equality line
  svg.append("line")
    .attr("x1", 0)
    .attr("y1", height)
    .attr("x2", width)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4");

  // Plot the points
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d["2022 Median Income"]))
    .attr("cy", d => y(d["2023 Median Income"]))
    .attr("r", d => size(d["2023 Number (thousands)"]))
    .attr("fill", d => color(d.Characteristic))
    .attr("opacity", 0.7)
    .append("title")  // Tooltip
    .text(d => `${d.Characteristic}\n2022: ${d["2022 Median Income"]}\n2023: ${d["2023 Median Income"]}`);

}).catch(error => console.error(error));
