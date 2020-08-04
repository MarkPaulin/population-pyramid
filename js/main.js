const margin = {top: 20, right: 20, bottom: 40, left: 20},
  gutter = 30,
  bandwidth = 5,
  height = 91 * bandwidth + margin.top + margin.bottom,
  width = 2 * 300 + gutter + margin.left + margin.right;

const delay = 750;

d3.csv("data/population.csv", d3.autoType).then(draw);

function draw(data) {
  let playing = false;

  let svg = d3.select("#plot-holder")
    .append("svg")
      .attr("height", height)
      .attr("width", width)
      .attr("id", "plot");

  let chart = drawPyramid(data);
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
      .on("drag", val => chart.redraw(val, 0))
      .on("end", val => chart.redraw(val, 0));

  let button = d3.select("#button-holder")
    .append("button")
      .text("play")
      .on("click", buttonclick);

  d3.select("#slider-holder")
    .append("svg")
      .attr("width", 100)
      .attr("height", height)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(slider);

  async function play() {
    while(playing && slider.value() < slider.max()) {
      slider.value(slider.value() + 1);
      chart.redraw(slider.value(), delay);
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
    if (playing) play();
  }

  async function firstdraw() {
    chart.redraw(d3.min(data, d => d.year), delay);
    await timer(delay);
    playing = true;
    play();
  }
}

function timer(ms) {
 return new Promise(res => setTimeout(res, ms));
}
