/*
 * DiaMetrics v1.0.0
 * https://github.com/lrosenplaenter/DiaMetrics
 * Copyright (c) 2023 - 2024 Leon Rosenplänter. 
 * DiaMetrics is available under the MIT license.
 */

// Set tutorial scatter plot 1
var options_tut = {
    responsive: true,
    scales: {
        x: {
            type: 'linear',
            position: 'bottom',
            title: {
                display: true,
                text: 'X-Axis',
            },
        },
        y: {
            type: 'linear',
            position: 'left',
            title: {
                display: true,
                text: 'Y-Axis',
            },
        }
    },
    plugins: {
        tooltip: {
            enabled: false
        },
        legend: {
            labels: {
                filter: item => item.text !== 'none'
            }
        },
        dragData: {
            dragX: true,
            onDragStart: (event) => {
                event.target.style.cursor = 'grabbing'
            },
            onDrag: () => {
                if (!throttleTimeout) {
                    // call the functions max x-times per second
                    throttleTimeout = setTimeout(() => {
                        // get linear equation from the points of the blue line
                        determine_equation_tutorial();
                        // calc spec, sens, ... 
                        calc_tutorial();
                        throttleTimeout = null;
                    }, throttleDelay);
                }
            },
            onDragEnd: (event) => {
                event.target.style.cursor = 'default'

                // update the blue line after drag to fit the whole canvas (data generated while dragging with determine_equation())
                scatterChart_tutorial_2.data.datasets[2].data[0].x = new_coordinates[0].x_value    
                scatterChart_tutorial_2.data.datasets[2].data[0].y = new_coordinates[0].y_value
                scatterChart_tutorial_2.data.datasets[2].data[1].x = new_coordinates[1].x_value
                scatterChart_tutorial_2.data.datasets[2].data[1].y = new_coordinates[1].y_value
                scatterChart_tutorial_2.update();
            }
        }
    }
};

// create the first scatter-plot
var ctx = document.getElementById('scatterChart_tutorial').getContext('2d');

if (typeof(scatterChart_tutorial) != 'undefined') {
    scatterChart_tutorial.update();
} else {
    var scatterChart_tutorial = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options_tut
    });
}

// create the second scatter-plot
var ctx_2 = document.getElementById('scatterChart_tutorial_2').getContext('2d');

if (typeof(scatterChart_tutorial_2) != 'undefined') {
    scatterChart_tutorial_2.update()
} else {
    var scatterChart_tutorial_2 = new Chart(ctx_2, {
        type: 'scatter',
        data: data,
        options: options_tut
    });
}

// Load the data example on the first page of the tutorial
function tutorial_load_example(status) {

    var example = document.getElementById('pick_example_tutorial').value

    var data_A;
    var data_B;
    if (example == 1) {
        document.getElementById('tut_1_2_button').disabled = false;
        data_A = [
            { x: 1, y: 6 },
            { x: 2, y: 7 },
            { x: 3, y: 8 },
            { x: 4, y: 9 },
            { x: 5, y: 8 },
            { x: 1, y: 7 },
            { x: 2, y: 6 },
            { x: 3, y: 9 },
            { x: 4, y: 8 },
            { x: 5, y: 10 },
            { x: 1, y: 8 },
            { x: 2, y: 10 },
            { x: 3, y: 6 },
            { x: 4, y: 10 },
            { x: 5, y: 9 },
            { x: 1, y: 9 },
            { x: 2, y: 8 },
            { x: 3, y: 7 },
            { x: 4, y: 6 },
            { x: 5, y: 6 }
        ]
        data_B = [
            { x: 0, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 4 },
            { x: 4, y: 1 },
            { x: 5, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 4 },
            { x: 3, y: 1 },
            { x: 4, y: 2 },
            { x: 5, y: 3 },
            { x: 5, y: 4 },
            { x: 2, y: 1 },
            { x: 3, y: 2 },
            { x: 4, y: 3 },
            { x: 6, y: 3 }
        ]
    } else if (example == 2) {
        document.getElementById('tut_1_2_button').disabled = false;
        data_A = [
            { x: 0, y: 6 },
            { x: 2, y: 7 },
            { x: 3, y: 8 },
            { x: 4, y: 9 },
            { x: 5, y: 6 },
            { x: 1, y: 7 },
            { x: 2, y: 8 },
            { x: 3, y: 9 },
            { x: 4, y: 6 },
            { x: 5, y: 7 },
            { x: 1, y: 8 },
            { x: 2, y: 9 },
            { x: 3, y: 6 },
            { x: 4, y: 7 },
            { x: 5, y: 8 },
            { x: 5, y: 9 },
            { x: 2, y: 6 },
            { x: 3, y: 8 },
            { x: 4, y: 8 },
            { x: 6, y: 8 }
        ]
        data_B = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 3 },
            { x: 1, y: 2 },
            { x: 2, y: 1 },
            { x: 3, y: 4 },
            { x: 4, y: 3 },
            { x: 5, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 4 },
            { x: 3, y: 1 },
            { x: 4, y: 2 },
            { x: 5, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 3 },
            { x: 3, y: 2 },
            { x: 4, y: 1 },
            { x: 5, y: 1 }
        ]
    }

    var data_C = [
        {x: 0, y: 5},
        {x: 6, y: 5},
    ]

    if (status == 1) {
        scatterChart_tutorial.data.datasets = [
            {   
                // xy-pairs for var A
                label: "Variable A",
                data: data_A,
                backgroundColor: '#fca503',
                type: 'scatter',
                dragData: false,
            },
            {
                // xy-pairs for var B
                label: "Variable B",
                data: data_B,
                backgroundColor: '#9842f5',
                type: 'scatter',
                dragData: false,
            },
            {
                // xy-pairs for blue line
                label: 'none',
                data: data_C,
                borderColor: '#3366FF',
                type: 'line',
                fill: false,
                dragData: false,
                pointRadius: 6,
                borderCapStyle: 'round',
            },
        ]
    
        scatterChart_tutorial.update()
        removeFirstOption_tutorial()
    }
    
    else if (status == 2) {
        scatterChart_tutorial_2.data.datasets = [
            {   
                // xy-pairs for var A
                label: "Variable A",
                data: data_A,
                backgroundColor: '#fca503',
                type: 'scatter',
                dragData: false,
            },
            {
                // xy-pairs for var B
                label: "Variable B",
                data: data_B,
                backgroundColor: '#9842f5',
                type: 'scatter',
                dragData: false,
            },
            {
                // xy-pairs for blue line
                label: 'none',
                data: data_C,
                borderColor: '#3366FF',
                type: 'line',
                fill: false,
                dragData: true, // setting dragable to "true" for second tutorial plot
                pointRadius: 6,
                borderCapStyle: 'round',
            },
        ]
    
        scatterChart_tutorial_2.update()
    }
}

// hide "Next" Buttons in Tutorial + reveal next paragraph
function tutorial_next_button (context) {
    document.getElementById('tut_1_'+context+'_button').style.display = "none"
    document.getElementById('tut_1_'+(context+1)).style.visibility = "visible"

    if (context == 1) {
        document.getElementById('pick_example_tutorial').disabled = false;
    }
    if (context == 3) {
        document.getElementById('tut_1_cont').disabled = false;
    }
}

// Hide "Pick an Example" from the selection elem when a different option is picked
let firstOptionRemoved_tutorial = false;
function removeFirstOption_tutorial() {
    const selectElement = document.getElementById('pick_example_tutorial');
    
    if (!firstOptionRemoved_tutorial) {
        selectElement.removeChild(selectElement.options[0]);
        firstOptionRemoved_tutorial = true;
    }
}


var separator_m = 0;
separator_b = 0;

// calc the linear equation (blue line) and reset point depending on calulated variable to axis values
function determine_equation_tutorial() {
    
    // get the data Points from the chart-object
    var ax = scatterChart_tutorial_2.data.datasets[2].data[0].x
    var ay = scatterChart_tutorial_2.data.datasets[2].data[0].y
    var bx = scatterChart_tutorial_2.data.datasets[2].data[1].x
    var by = scatterChart_tutorial_2.data.datasets[2].data[1].y

    var coordinates = [{x_value: ax, y_value: ay},{x_value: bx, y_value: by}]

    // y = x * m + b

    // calc deviation from point to point 
    var deviation_y = coordinates[1].y_value - coordinates[0].y_value
    var deviation_x = coordinates[1].x_value - coordinates[0].x_value

    // calc slope
    var m = deviation_y / deviation_x
    separator_m = m //set value to global var

    // calc intercept
    var b = -m * coordinates[0].x_value + coordinates[0].y_value
    separator_b = b

    // calculate the new points of the linear line and update the plot
    // get min & max value of the x axis
    var x_axis_min = scatterChart_tutorial_2.scales.x.min
    var x_axis_max = scatterChart_tutorial_2.scales.x.max

    // calc y-values for min & max values of x axis
    var ay = x_axis_min * m + b
    var by = x_axis_max * m + b
    new_coordinates = [{x_value: x_axis_min, y_value: ay},{x_value: x_axis_max, y_value: by}]
}

// change cursor on hover
function change_cursor_on_hover_tutorial(mousemove) {
    const cursor_position = scatterChart_tutorial_2.getElementsAtEventForMode(mousemove, 'nearest', {intersect: true}, true);

    if (cursor_position[0]) {
        const datasetIndex = cursor_position[0].datasetIndex;

        // Check if the cursor is over the third dataset (blue line, data_C)
        if (datasetIndex === 2) {
            mousemove.target.style.cursor = 'grab';
        } else {
            mousemove.target.style.cursor = 'default';
        }
    } else {
        mousemove.target.style.cursor = 'default';
    }

}

scatterChart_tutorial_2.canvas.addEventListener('mousemove', (e) => {
    change_cursor_on_hover_tutorial(e);
})

function calc_tutorial() {
    // get data from X (A) & Y (B), depending on the example
    var data_X = scatterChart_tutorial_2.data.datasets[0].data
    var data_Y = scatterChart_tutorial_2.data.datasets[1].data

    // count points above & below separator for X
    var num_above_X = 0;
    var num_below_X = 0;
    for (var i in data_X) {
        var y = data_X[i].x * separator_m + separator_b // y = x * m + b
        if (data_X[i].y >= y) {
            num_above_X ++;
        } else if (data_X[i].y < y) {
            num_below_X ++;
        }
    }

    // count points above & below separator for Y
    var num_above_Y = 0;
    var num_below_Y = 0;
    for (var i in data_Y) {
        var y = data_Y[i].x * separator_m + separator_b // y = x * m + b
        if (data_Y[i].y >= y) {
            num_above_Y ++;
        } else if (data_Y[i].y < y) {
            num_below_Y ++;
        }
    }
    
    var con_table_X = {total: sample_size_A + sample_size_B, actual_group_A: sample_size_A, actual_group_B: sample_size_B, results_pos: 0, results_neg: 0, true_pos: 0, false_pos: 0, true_neg: 0, false_neg: 0}

    // Con-Table for (X/A)
    con_table_X.true_pos =  num_above_X
    con_table_X.false_pos =  num_above_Y
    con_table_X.true_neg =  num_below_Y
    con_table_X.false_neg =  num_below_X
    con_table_X.results_pos = con_table_X.true_pos + con_table_X.false_pos
    con_table_X.results_neg = con_table_X.true_neg + con_table_X.false_neg

    // show the data in the html table
    // Table for Var A
    document.getElementById('con_table_A_true_pos_tutorial').innerHTML = con_table_X.true_pos
    document.getElementById('con_table_A_false_pos_tutorial').innerHTML = con_table_X.false_pos
    document.getElementById('con_table_A_true_neg_tutorial').innerHTML = con_table_X.true_neg
    document.getElementById('con_table_A_false_neg_tutorial').innerHTML = con_table_X.false_neg
    document.getElementById('con_table_A_pos_results_n_tutorial').innerHTML = con_table_X.results_pos
    document.getElementById('con_table_A_neg_results_n_tutorial').innerHTML = con_table_X.results_neg

    // calc Speci & Sensi
    var results = [
        {name: "sensi", elem_A: document.getElementById('sensi_tutorial'), value_A: con_table_X.true_pos / 20},
        {name: "speci", elem_A: document.getElementById('speci_tutorial'), value_A: con_table_X.true_neg / 20},
    ];

    // display the values in html, for var A and B, use placeholders for infinity or NaN
    var placeholder_not_possible = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'
    var placeholder_infinity = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-infinity" viewBox="0 0 16 16"><path d="M5.68 5.792 7.345 7.75 5.681 9.708a2.75 2.75 0 1 1 0-3.916ZM8 6.978 6.416 5.113l-.014-.015a3.75 3.75 0 1 0 0 5.304l.014-.015L8 8.522l1.584 1.865.014.015a3.75 3.75 0 1 0 0-5.304l-.014.015L8 6.978Zm.656.772 1.663-1.958a2.75 2.75 0 1 1 0 3.916L8.656 7.75Z"/></svg>'
    for (var i in results) {
        if (results[i].value_A == null || isNaN(results[i].value_A)) {
            results[i].elem_A.innerHTML = placeholder_not_possible
        } else if (!isFinite(results[i].value_A)) {
            results[i].elem_A.innerHTML = placeholder_infinity
        } else {
            results[i].elem_A.innerHTML = Math.round(results[i].value_A * 100) /100
        }
    }

    // activate "continue "button" on page 2 of the tutorial
    if (results[0].value_A != 1 || results[1].value_A != 1) {
        document.getElementById('tut_2_cont').disabled = false;
    }
}