let xTicks = [0, 2500, 5000, 7500, 10000, 12500, 15000];

let colourScale1 = d3.scaleOrdinal()
    .domain(["F", "M"])
    .range(["#f07665", "#55a6a1"]);

let colourScale2 = d3.scaleOrdinal()
    .domain(["F", "M"])
    .range(["#e04731", "#178a84"]);

function drawPyramid(data) {
  let svg = d3.select("#plot");

  let x1 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.MYE)]).nice()
      .range([(width - gutter) / 2, margin.left]);

  let x2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.MYE)]).nice()
      .range([(width + gutter) / 2, width - margin.right]);

  let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.age) + 1])
      .range([height - margin.bottom, margin.top]);

  let x1Axis = g => g
      .attr("transform", `translate(0, ${height - margin.bottom + 20})`)
      .call(d3.axisBottom(x1)
              .tickValues(xTicks)
              .tickSize(-(height - margin.top - margin.bottom + 20)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5));

  let x2Axis = g => g
      .attr("transform", `translate(0, ${height - margin.bottom + 20})`)
      .call(d3.axisBottom(x2)
              .tickValues(xTicks)
              .tickSize(-(height - margin.top - margin.bottom + 20)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5));

  let yAxis = g => g
      .attr("transform", `translate(${width / 2}, ${bandwidth / 2})`)
      .call(d3.axisLeft(y).tickPadding(0))
      .call(g => g.selectAll(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text")
              .attr("text-anchor", "middle")
              .attr("x", 0));

  let gx1 = svg.append("g")
      .call(x1Axis);

  let gx2 = svg.append("g")
      .call(x2Axis);

  svg.append("g")
      .call(yAxis);

  let group = svg.append("g");

  let rect = group.selectAll("rect .bar");

  let comparison = group.selectAll("rect .comp");

  let label = svg.append("g")
      .style("font", "bold 20px sans-serif")
      .style("font-variant-numeric", "tabular-nums")
      .attr("transform", "translate(10, 20)")
    .append("text");

  return Object.assign(svg.node, {
    redraw(year, duration) {
      const t = svg.transition()
          .duration(duration);

      rect = rect
          .data(data.filter(d => d.year === year), d => `${d.gender}:${d.year - d.age}`)
          .join(
            enter => enter.append("rect")
              .attr("fill", d => colourScale2(d.gender))
              .attr("x", d => d.gender === "F" ? x1(0) : x2(0))
              .attr("y", d => y(d.age) + bandwidth)
              .attr("width", 0)
              .attr("height", bandwidth - 1)
              .attr("class", "bar"),
            update => update,
            exit => exit.call(rect => rect.transition(t).remove()
               .attr("x", d => d.gender == "F" ? x1(0) : x2(0))
               .attr("y", d => y(d.age + 1))
               .attr("width", 0)
               .attr("class", "bar"))
           );

      comparison = comparison
          .data(data.filter(d => d.year === year), d => `${d.gender}:${d.year - d.age}`)
          .join(
            enter => enter.append("rect")
              .attr("fill", d => colourScale1(d.gender))
              .attr("x", d => d.gender === "F" ? x1(0) : x2(0))
              .attr("y", d => y(d.age) + bandwidth)
              .attr("width", 0)
              .attr("height", bandwidth - 1)
              .attr("class", "comp"),
            update => update,
            exit => exit.call(rect => rect.transition(t).remove()
               .attr("x", d => d.gender == "F" ? x1(0) : x2(0))
               .attr("y", d => y(d.age + 1))
               .attr("width", 0)
               .attr("class", "comp"))
           );

      rect.transition(t)
           .attr("x", d => d.gender === "F" ? x1(d.MYE) : x2(0))
           .attr("width", d => d.gender === "F" ? x1(0) - x1(d.MYE) : x2(d.MYE) - x2(0))
           .attrTween("y", d => interpolateInverseCubic(y(d.age) + bandwidth, y(d.age)));

      comparison.transition(t)
          .attr("x", d => d.gender === "F" ? x1(d.min) : x2(0))
          .attr("width", d => d.gender == "F" ? x1(0) - x1(d.min) : x2(d.min) - x2(0))
          .attrTween("y", d => interpolateInverseCubic(y(d.age) + bandwidth, y(d.age)));

      gx1.raise();
      gx2.raise();
      label.text(year).raise();
    }
  })
};

function interpolateInverseCubic(start, end) {
  return t => d3.interpolate(start, end)(inverseEaseCubic(t));
}

function inverseEaseCubic(x) {
  return x < .5 ? Math.cbrt(x / 4) : (2 - Math.cbrt(2 - 2 * x)) / 2;
}
