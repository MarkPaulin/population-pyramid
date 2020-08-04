function drawOutline(data) {
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

  let group = svg.append("g").attr("id", "outline");

  let outline = group.selectAll("path");

  let line1 = d3.line()
      .x(d => x1(d.MYE))
      .y(d => y(d.age))
      .curve(d3.curveStepAfter);

  let line2 = d3.line()
      .x(d => x2(d.MYE))
      .y(d => y(d.age))
      .curve(d3.curveStepAfter);

  return Object.assign(group, {
    redraw(year) {
      let lineData = d3.nest()
        .key(d => d.gender)
        .entries(data.filter(d => d.year == year));

      lineData.map(d => {
        d.values.unshift({age: -1, MYE: d.values[0].MYE});
        return d;
      });

      outline = outline
        .data(lineData, d => d.key)
          .join(
            enter => enter.append("path")
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("d", d => d.key === "F" ? line1(d.values) : line2(d.values)),
            update => update
              .attr("stroke", "black")
              .attr("d", d => d.key === "F" ? line1(d.values) : line2(d.values)),
            exit => exit.remove()
          );
    }
  })
};
