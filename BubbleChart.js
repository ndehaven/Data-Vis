document.addEventListener("DOMContentLoaded", function () {
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#graph5")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add a dropdown container
  const dropdownContainer = d3
    .select("#graph5")
    .append("div")
    .attr("id", "dropdown-container")
    .style("margin-bottom", "20px")
    .style("text-align", "center");

  // Add a tooltip container
  const tooltip = d3
    .select("#graph5")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  d3.csv("CSVs/GlobalFoodInflation.csv")
    .then((data) => {
      // Process the data
      data = data.filter(d => d.Inflation).map(d => ({
        inflationRate: +d.Inflation, // Convert Inflation to numeric
        country: d.country,
        date: new Date(d.date),
        year: new Date(d.date).getFullYear()
      }));

      // Get unique countries
      const uniqueCountries = [...new Set(data.map(d => d.country))].sort();

      // Add a dropdown menu
      const dropdown = dropdownContainer
        .append("select")
        .attr("id", "country-filter")
        .style("padding", "5px")
        .style("font-size", "14px");

      // Populate the dropdown
      dropdown
        .selectAll("option")
        .data(["All", ...uniqueCountries])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

      // Scales
      const x = d3
        .scaleBand()
        .domain([...new Set(data.map((d) => d.country))])
        .range([0, width])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d.year) - 1, d3.max(data, (d) => d.year) + 1])
        .range([height, 0]);

      const size = d3
        .scaleSqrt()
        .domain([0, d3.max(data, (d) => d.inflationRate)])
        .range([5, 30]);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // X-axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // Y-axis
      svg.append("g").call(d3.axisLeft(y));

      // Function to update the chart based on the selected country
      const updateChart = (selectedCountry) => {
        const filteredData = selectedCountry === "All"
          ? data
          : data.filter(d => d.country === selectedCountry);

        // Bind data to circles
        const circles = svg.selectAll("circle").data(filteredData);

        // Remove old circles
        circles.exit().remove();

        // Update existing circles
        circles
          .attr("cx", (d) => x(d.country) + x.bandwidth() / 2)
          .attr("cy", (d) => y(d.year))
          .attr("r", (d) => size(d.inflationRate))
          .attr("fill", (d) => color(d.country));

        // Add new circles
        circles
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.country) + x.bandwidth() / 2)
          .attr("cy", (d) => y(d.year))
          .attr("r", (d) => size(d.inflationRate))
          .attr("fill", (d) => color(d.country))
          .attr("opacity", 0.7)
          .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

            // Show and position tooltip
            tooltip
              .html(
                `<strong>Country:</strong> ${d.country}<br>
                 <strong>Inflation:</strong> ${d.inflationRate}%<br>
                 <strong>Year:</strong> ${d.year}`
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            // Move tooltip with mouse
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", "none");

            // Hide tooltip
            tooltip.style("opacity", 0);
          });
      };

      // Initialize chart
      updateChart("All");

      // Add event listener for dropdown changes
      dropdown.on("change", function () {
        const selectedCountry = this.value;
        updateChart(selectedCountry);
      });

      // X-axis label
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Countries");

      // Y-axis label
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Year");
    })
    .catch((error) => {
      console.error("Error loading the CSV file:", error);
    });
});
