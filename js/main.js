
d3.csv("data/population.csv", d3.autoType).then(draw)

const margin = {top: 20, right: 20, bottom: 40, left: 20}
const gutter = 20
const bar_height = 5
const height = 91 * bar_height + margin.top + margin.bottom
const width = 2 * 300 + gutter + margin.left + margin.right

let svg = d3.select("#plot")
  .append("svg")
    .attr("height", height)
    .attr("width", width)

let xTicks = [0, 2500, 5000, 7500, 10000, 12500, 15000]

function draw(data) {
  plot_data = data.filter(d => d.year === 2019)

  let x1 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.MYE)]).nice()
      .range([(width - gutter) / 2, margin.left])

  let x2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.MYE)]).nice()
      .range([(width + gutter) / 2, width - margin.right])

  let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.age) + 1])
      .range([height - margin.bottom, margin.top])

  x1Axis = g => g
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x1)
              .tickValues(xTicks)
              .tickSize(-(height - margin.top - margin.bottom)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5))

  x2Axis = g => g
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x2)
              .tickValues(xTicks)
              .tickSize(-(height - margin.top - margin.bottom)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5))

  yAxis = g => g
      .attr("transform", `translate(${width / 2}, ${-bar_height / 2})`)
      .call(d3.axisLeft(y).tickPadding(0))
      .call(g => g.selectAll(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text")
              .attr("text-anchor", "middle")
              .attr("x", 0))

  svg.append("g")
    .selectAll("rect")
    .data(plot_data)
    .enter().append("rect")
      .attr("fill", d => d3.schemeSet2[d.gender === "F" ? 0 : 1])
      .attr("x", d => d.gender === "F" ? x1(d.MYE) : x2(0))
      .attr("y", d => y(d.age + 1))
      .attr("width", d => d.gender === "F" ? x1(0) - x1(d.MYE) : x2(d.MYE) - x2(0))
      .attr("height", d => y(d.age) - y(d.age + 1) - 1)

  svg.append("g")
      .call(x1Axis)

  svg.append("g")
      .call(x2Axis)

  svg.append("g")
      .call(yAxis)
}
