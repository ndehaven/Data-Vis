// MultiLine Graph Visualization by Justin Nguyen
let vgData = []
let cpiData = []
let platformArray = []
let filteredVgData = []
let selectedPlatforms = {}


document.addEventListener('DOMContentLoaded', function() {
    loadCSVs().then(function(){
        drawLineGraph();
    })

})

async function loadCSVs() {
    let csvs = await Promise.all([d3.csv('CSVs/vgsales.csv', d3.autoType), d3.csv('CSVs/cpi.csv')])
    vgData = csvs[0].map(d => ({
        "Platform": d["Platform"],
        "Year":  d["Year"],
        "NA_Sales": d["NA_Sales"]
    }))
    cpiData = csvs[1].map(d => ({
        "year": parseInt(d["Year"]),
        "value": parseFloat(d["Jan"])
    }));
    console.log(cpiData)
    filteredVgData = vgData.filter(function(entry) {return entry.Year >= 2000 && entry.Year != "N/A"})
    
    selectedPlatforms = filteredVgData.reduce(function(platforms, entry){
        if (!platforms[`${entry.Platform}`]) {
            platforms[`${entry.Platform}`] = {selected: false, salesPerYear: {[`${entry.Year}`]: entry.NA_Sales}}
        }
        else {
            if (platforms[`${entry.Platform}`].salesPerYear[`${entry.Year}`]) {
                platforms[`${entry.Platform}`].salesPerYear[`${entry.Year}`] = parseFloat(platforms[`${entry.Platform}`].salesPerYear[`${entry.Year}`] + entry.NA_Sales).toFixed(2)
            }
            else {
                platforms[`${entry.Platform}`].salesPerYear[`${entry.Year}`] = `${entry.NA_Sales}`
            }
        }

        return platforms;
    },{})   
}

function drawLineGraph() {
    d3.select("#lineGraphViz").selectAll("svg").remove()
    d3.select("#platformSelect").selectAll("*").remove()
    var margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var color = d3.scaleOrdinal()
        .domain(Object.keys(selectedPlatforms))
        .range(d3.schemeObservable10)
    
    d3.select("#CPILabel")
        .style("color", color("CPI"))

    platformArray = Object.keys(selectedPlatforms)
    let checkBoxOptions = d3.select("#platformSelect")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "start")
        .selectAll("input")
        .data(platformArray)
        .enter()
        .append("div");
    
    checkBoxOptions.append("input")
        .attr("type", "checkbox")
        .attr("id", function(d) {return d})
        .attr("name", function(d) {return d})
        .attr("value", function(d) {return d})
        .attr("checked", function(d) {
            return selectedPlatforms[`${d}`].selected? true: undefined
        })
        .on("click", function (e) {
            selectedPlatforms[`${e.target.value}`].selected = !selectedPlatforms[`${e.target.value}`].selected
            drawLineGraph();
        })
    
    checkBoxOptions.append("label")
        .attr("for", function(d) {return d})
        .text(function(d) {return d})
        .style("color", function(d) {console.log("hello");return selectedPlatforms[`${d}`].selected? color(d): "black"})
    
    var svg = d3.select("#lineGraphContainer")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    let yearArray = Object.keys(Object.values(selectedPlatforms).filter(function(platform){return platform.selected}).reduce(function(years, platform) {
        Object.keys(platform.salesPerYear).forEach(function(year) {
            if (!years[`${year}`]) {
                years[`${year}`] = {}
            }
        })
        return years;
    }
    ,{}))
    if (yearArray.length == 0) {
        yearArray = cpiData.map(function(entry) {
            return entry.year
        })
    }
    console.log(yearArray)
    
    let data = [{key: "CPI", values: cpiData.filter(function(entry) {
        return entry.year >= yearArray[0]
    })}, ...Object.keys(selectedPlatforms).filter(function(platformName) {return selectedPlatforms[`${platformName}`].selected}).map(function(platformName){
        let entry = {key: platformName, values: Object.entries(selectedPlatforms[`${platformName}`].salesPerYear).map(function ([year,sales]) {
            return {year: parseInt(year), value: Object.entries(selectedPlatforms[`${platformName}`].salesPerYear).reduce(function(sum, [salesYear, value]){
                if (parseInt(salesYear) <= parseInt(year)) {
                    sum += parseFloat(value);
                }
                return sum
            },0) }
        })}
        return entry;
    })]
    
    //Title
    svg.append("text")
        .attr("x", width/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Comparison of CPI Against Video Game Units Sold")
    
    var x = d3.scaleLinear()
        .domain([yearArray[0],yearArray[yearArray.length - 1]])
        .range([0,width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Years")

    var y = d3.scaleLinear()
        .domain([0, d3.max(cpiData, function(d) {
            return d.value
        })])
        .range([height,0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".line")
        .data(data)
        .enter()
        .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
            return d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(d.value); })
                (d.values)
        })
}

