AOS.init({
  duration: 1000, 
  easing: 'ease-in-out', 
  once: true, 
  offset: 900, 
});

createPieChart('CSVs/jersey_prices.csv', '#pieChartViz svg');
