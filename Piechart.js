// Function to create the interactive pie chart
function createPieChart(csvFilePath, svgSelector) {
  d3.csv(csvFilePath).then((data) => {
    data.forEach(d => {
      d.averagePrice = +d.averagePrice; // Convert averagePrice to a number
    });

    const width = 600;
    const height = 450;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(svgSelector)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`); // Centering the pie chart

    const pie = d3.pie()
        .value(d => d.averagePrice);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.year))
        .range(d3.schemeCategory10);

    let pieData = pie(data);

    const slices = svg.selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.year))
        .attr('stroke', '#fff')
        .attr('stroke-width', '2px')
        .on('mouseover', function (event, d) {
          // Testing testing
          console.log(`Year: ${d.data.year}, Average Price: $${d.data.averagePrice}`);

          d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke', '#000')
              .attr('stroke-width', '3px');

          const tooltip = svg.append('text')
              .attr('x', 0)
              .attr('y', -radius - 20)
              .attr('text-anchor', 'middle')
              .attr('fill', '#333')
              .attr('font-size', '28px')
              .attr('id', 'tooltip2')
              .text(`Year: ${d.data.year}, Avg Price: $${d.data.averagePrice}`);
        })
        .on('mouseout', function () {
          d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke', '#fff')
              .attr('stroke-width', '2px');

          d3.select('#tooltip2').remove();
        })
        .call(
            d3.drag()
                .on('drag', function (event, d) {
                  const [x, y] = d3.pointer(event, svg.node());
                  const dragAngle = Math.atan2(y, x);

                  // Move slice dynamically with drag
                  d3.select(this)
                      .attr('transform', `translate(${x}, ${y})`);

                  d.dragAngle = dragAngle;
                })
                .on('end', function (event, d) {
                  const dragAngle = d.dragAngle || 0; // Default to original angle if dragAngle is undefined
                  let swapped = false;

                  pieData.forEach((slice, i) => {
                    if (slice !== d) {
                      const sliceAngle = (slice.startAngle + slice.endAngle) / 2;
                      const angleDiff = Math.abs(dragAngle - sliceAngle);

                      // Check if slices overlap (threshold < 0.5 radians)
                      if (angleDiff < 0.5) {
                        swapped = true;

                        // Swap data positions in the pieData array
                        const draggedIndex = pieData.indexOf(d);
                        const targetIndex = i;

                        [pieData[draggedIndex], pieData[targetIndex]] =
                            [pieData[targetIndex], pieData[draggedIndex]];

                        // Recalculate pie layout
                        const newPieData = pie(pieData.map(d => d.data));

                        // Update slices
                        slices.data(newPieData)
                            .transition()
                            .duration(500)
                            .attr('d', arc)
                            .attr('transform', 'translate(0,0)');
                      }
                    }
                  });

                  // If no swap, return slice to original position
                  if (!swapped) {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('transform', 'translate(0,0)');
                  }
                })
        );

    // Attach the rotation logic to the button click
    d3.select("#rotateButton").on("click", function () {
      rotateChart(svg, slices, arc);
    });
    d3.select("#changeColorButton").on("click", function () {
      changeColor(slices);
    });
  });
}

// Function to rotate the pie chart with a random angle on each click
let totalRotation = 0; // Variable to accumulate total rotation angle

function rotateChart(svg, slices, arc) {
  // Generate a random angle for each rotation between 0 and 360 degrees
  const randomRotation = Math.floor(Math.random() * 360);

  // Accumulate total rotation
  totalRotation += randomRotation;

  // Apply the new rotation by adding the accumulated rotation to the previous one
  svg.transition()
      .duration(500)
      .attr('transform', `translate(300, 225) rotate(${totalRotation})`);  // Only rotating, position remains fixed

  // Update each slice's rotation and redraw the arc
  slices.transition()
      .duration(500)
      .attr('d', arc)
      .attr('transform', `rotate(${totalRotation})`);
}

// Function to change the color of each slice to a random color
function changeColor(slices) {
  // Function to generate a random color
  function randomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;  // Generates a random hue for each color
  }

  // Apply the random colors with a smooth transition
  slices.transition()
      .duration(500)  // Duration of the color transition
      .attr('fill', function(d) {
        return randomColor();  // Assign a random color to each slice
      });
}


// Make the function accessible globally
window.createPieChart = createPieChart;
