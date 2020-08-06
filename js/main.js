const margin = {top: 20, right: 20, bottom: 50, left: 20},
  gutter = 30,
  bandwidth = 7,
  height = 91 * bandwidth + margin.top + margin.bottom,
  width = 2 * 300 + gutter + margin.left + margin.right;

const delay = 750;

d3.csv("data/population.csv", d3.autoType).then(draw);

function draw(data) {
  let playing = false;
  let sliding = false;
  let outlined = false;

  let svg = d3.select("#plot-holder")
    .append("svg")
      .attr("height", height)
      .attr("width", width)
      .attr("id", "plot");

  let chart = drawPyramid(data);
  let outline = drawOutline(data);

  firstdraw();

  let slider = d3.sliderRight()
      .min(d3.min(data, d => d.year))
      .max(d3.max(data, d => d.year))
      .step(1)
      .height(height - margin.top - margin.bottom)
      .tickFormat(d3.format("d"))
      .displayValue(false)
      .default(1971)
      .on("start", val => chart.redraw(val, 0))
      .on("drag", val => {
        chart.redraw(val, 0);
        sliding = true;
      })
      .on("end", val => slideend(val));

  let button = d3.select("#button-holder")
    .append("button")
      .text("play")
      .on("click", buttonclick);

  let outlinebutton = d3.select("#outline-button-holder")
    .append("button")
      .text("outline")
      .on("click", outlineClick);

  d3.select("#slider-holder")
    .append("svg")
      .attr("width", 100)
      .attr("height", height)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(slider);

  svg.on("mousewheel", () => {
    d3.event.preventDefault();

    let wasPlaying = playing;
    if (playing) playing = false;

    let delta = Math.round((slider.max() - slider.min()) * d3.event.deltaY / 250);
    let newYear = slider.value() + delta;
    newYear = newYear >= slider.min() ? newYear <= slider.max() ? newYear : slider.max() : slider.min();

    if (newYear === slider.max()) {
      wasPlaying = false;
    }

    slider.value(newYear);
    chart.redraw(newYear, 0);

    outline.raise();

    if (wasPlaying) {
      playing = true;
    }
  })

  async function play() {
    while(true) {
      if (playing && (slider.value() < slider.max()) && !sliding) {
        slider.value(slider.value() + 1);
        chart.redraw(slider.value(), delay);

        if (slider.value() == slider.max()) {
          playing = false;
        }

        outline.raise();
      }
      await timer(delay);
    }
  }

  async function buttonclick() {
    if (slider.value() === slider.max()) {
      playing = false;
      slider.value(slider.min());
      chart.redraw(slider.value(), 0);
      await timer(delay);
    }

    playing = !playing;
  }

  async function firstdraw() {
    chart.redraw(d3.min(data, d => d.year), delay);
    await timer(delay);
    playing = true;
    play();
  }

  async function slideend(x) {
    chart.redraw(x, 0);

    if (sliding) {
      sliding = false;
      await timer(delay / 3);
    }
  }

  function hideOutline() {
    outline.selectAll("path")
      .attr("stroke", "none");
  }

  function outlineClick() {
    if (!outlined) {
      outline.redraw(slider.value());
      outlined = true;
    } else {
      hideOutline();
      outlined = false;
    }
  }
}

function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
}
