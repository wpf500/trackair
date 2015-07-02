export default function () {
    Array.from(document.querySelectorAll('.score')).forEach(el => {
        var width = el.clientWidth;
        var height = el.clientHeight;

        var value = el.textContent;

        el.className += ' is-hidden';

        var radius = Math.min(width, height) / 2,
            innerRadius = 0.3 * radius;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.width; });

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([0, 0])
          .html(function(d) {
            return d.data.label + ": <span style='color:#a60947'>" + d.data.score + "</span>";
          });

        var arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(function (d) { 
            return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; 
          });

        var outlineArc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);


        var data = [
            {
                'label': 'NO2',
                'id': 'NO2',
                'score': parseFloat(el.getAttribute('data-NO2'))
            },
            {
                'label': 'PM10',
                'id': 'PM10',
                'score': parseFloat(el.getAttribute('data-PM10'))
            },
            {
                'label': 'PM25',
                'id': 'PM25',
                'score': parseFloat(el.getAttribute('data-PM25'))
            },
            {
                'label': 'O3',
                'id': 'O3',
                'score': parseFloat(el.getAttribute('data-NO2'))
            },
            {
                'label': 'SO2',
                'id': 'SO2',
                'score': parseFloat(el.getAttribute('data-PM25'))
            }
        ];

        var svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.call(tip);

        var color = {
            'NO2': '#ff977f',
            'PM25': '#72af7e',
            'PM10': '#ffce4b',
            'SO2': '#dcdcdc',
            'O3': '#c5d4ea'
        };

          data.forEach(function(d) {
            d.order  = 1;
            d.color  =  color[d.label];
            d.weight = 1;
            d.score  = +d.score;
            d.width  = +d.weight;
            d.label  =  d.label;
          });

          var path = svg.selectAll(".solidArc")
              .data(pie(data))
            .enter().append("path")
              .attr("fill", function(d) { return d.data.color; })
              .attr("class", "solidArc")
              .attr("stroke", "white")
              .attr("d", arc)
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

        // calculate score Will helppp
          var score = 
            data.reduce(function(a, b) {
              return a + (b.score * b.weight); 
            }, 0) / 
            data.reduce(function(a, b) { 
              return a + b.weight; 
            }, 0);

          svg.append("svg:text")
            .attr("class", "aster-score")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") // text-align: right
            .text(value);

    });
}
