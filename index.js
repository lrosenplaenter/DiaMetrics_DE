/*
 * DiaMetrics_DE v1.0.0
 * https://github.com/lrosenplaenter/DiaMetrics_DE
 * Copyright (c) 2024 Leon Rosenplänter. 
 * DiaMetrics is available under the MIT license.
 */

/*** Show Tutorial ***/
var show_tutorial_var = true;

/*** Define Plot ***/
var data = {
    datasets: []
};

// vars used to limit the rate of calls while dragging the separator
var throttleTimeout;
const throttleDelay = 50; //delay between calls while dragging the separator in ms

// configuration of scatter-plot
var new_coordinates; // var to hold values of new points calculated on drag of the blue line
var options = {
    maintainAspectRatio: false,
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
            onDrag: (event) => {
                if (!throttleTimeout) {
                    // call the functions max x-times per second
                    throttleTimeout = setTimeout(() => {
                        // get linear equation from the points of the blue line
                        determine_equation();
                        // calc spec, sens, ... 
                        calc();
            
                        throttleTimeout = null;
                    }, throttleDelay);
                }
            },
            onDragEnd: (event) => {
                event.target.style.cursor = 'default'

                // update the blue line after drag to fit the whole canvas (data generated while dragging with determine_equation())
                scatterChart.data.datasets[2].data[0].x = new_coordinates[0].x_value    
                scatterChart.data.datasets[2].data[0].y = new_coordinates[0].y_value
                scatterChart.data.datasets[2].data[1].x = new_coordinates[1].x_value
                scatterChart.data.datasets[2].data[1].y = new_coordinates[1].y_value
                scatterChart.update();
            }
        }
    }
};

// create the scatter-plot
var ctx = document.getElementById('scatterChart').getContext('2d');

if (typeof(scatterChart) != 'undefined') {
    scatterChart.update()
} else {
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
}

// declaring diagram variables
var label_A = 'Variable A'
var label_B = 'Variable B'
var label_scale_X = 'X-Axis'
var label_scale_Y = 'Y-Axis'
var sample_mean = 0;
var sample_stdDev = 0;
var sample_A_scaleX_min = null;
var sample_A_scaleY_min = null;
var sample_B_scaleX_min = null;
var sample_B_scaleY_min = null;
var sample_A_scaleX_max = null;
var sample_A_scaleY_max = null;
var sample_B_scaleX_max = null;
var sample_B_scaleY_max = null;
var sample_size_A = 200;
var sample_size_B = 200;
var data_A = null;
var data_B = null;
var data_C = null; // data points for the separator
var color_A= '#000000';
var color_B = '#000000';
var separator_m = null;
var separator_b = null;

/*** Display device warning if nessecary ***/
if (window.innerWidth <= 768) {
    display_device_alert ();
} else if (!window.matchMedia('(pointer:fine)').matches) {
    display_device_alert ();
} else if (show_tutorial_var == true){
    show_tutorial()
}

//display_device_alert()
function display_device_alert() {
    var modal = new bootstrap.Modal(document.getElementById('device-warning'));
    modal.show();
}

/*** Display Tutorial ***/
function show_tutorial () {
    var modal = new bootstrap.Modal(document.getElementById('tutorial-0'));
    modal.show();
}

/*** generating data depending on the picked example & other funtionality ***/
function generate_data (status) {

    // remove the frist option of the example-select 
    removeFirstOption()

    // get the example: 1=Cats & Dogs 2=Man & Woman 3=Ill & Healthy
    var example = document.getElementById('pick_example').value

    //calc Dataset depending on the example
    if (example == 1) {
        /** Cats & Dogs **/
        label_A = 'Cats'
        label_B = 'Chihuahuas'
        label_scale_X = 'Body weight (kg)'
        label_scale_Y = 'Brain weight (g)'
        color_A = '#fca503'
        color_B = '#9842f5'

        // Cats
        // Body weight
        sample_mean_A_scaleX = 3.6;
        sample_stdDev_A_scaleX = 1.2;
        sample_A_scaleX_min = 1.5;
        sample_A_scaleX_max = 6;
        //Brain weight
        sample_mean_A_scaleY = 29;
        sample_stdDev_A_scaleY = 5.1;
        sample_A_scaleY_min = 20;
        sample_A_scaleY_max = null;

        // Dogs
        // Body weight
        sample_mean_B_scaleX = 2.6;
        sample_stdDev_B_scaleX = 1.2;
        sample_B_scaleX_min = 1;
        sample_B_scaleX_max = 5;
        //Brain weight
        sample_mean_B_scaleY = 53.4;
        sample_stdDev_B_scaleY = 8.1;
        sample_B_scaleY_min = 1;
        sample_B_scaleY_max = 75;

    } else if (example == 2) {
        /** Man and Woman **/
        label_A = 'likely successful'
        label_B = 'unlikely successful'
        label_scale_X = 'Reasoning (IQ)'
        label_scale_Y = 'Leadership experience (years)'
        color_A = '#008080'
        color_B = '#FF6F61'

        // import data from data.js
        data_A = ext_data.data_a
        data_B =ext_data.data_b

    } else if (example == 3) {
        /** Ill and healthy **/
        label_A = 'Depression'
        label_B = 'Anxiety'
        label_scale_X = 'STAI-T Score'
        label_scale_Y = 'BDI-II Score'
        color_A = '#ded414'
        color_B = '#160f7a'

        // Depressed Patients
        // STAI-T
        sample_mean_A_scaleX = 65;
        sample_stdDev_A_scaleX = 10;
        sample_A_scaleX_min = 40;
        sample_A_scaleX_max = 80;
        // BDI-II
        sample_mean_A_scaleY = 30;
        sample_stdDev_A_scaleY = 7;
        sample_A_scaleY_min = 14;
        sample_A_scaleY_max = 63;

        // Axienty Patients
        // STAI-T
        sample_mean_B_scaleX = 50;
        sample_stdDev_B_scaleX = 8;
        sample_B_scaleX_min = 40;
        sample_B_scaleX_max = 80;
        // BDI-II
        sample_mean_B_scaleY = 15;
        sample_stdDev_B_scaleY = 5;
        sample_B_scaleY_min = 0;
        sample_B_scaleY_max = 30;
    }

    if (example == 1 || example == 3) {
        // Generate the samples with the parameters defined above according to the example.
        var data_A_ScaleX = generate_sample(sample_mean_A_scaleX, sample_stdDev_A_scaleX, sample_A_scaleX_min, sample_A_scaleX_max, sample_size_A);
        var data_A_ScaleY = generate_sample(sample_mean_A_scaleY, sample_stdDev_A_scaleY, sample_A_scaleY_min, sample_A_scaleY_max, sample_size_A);
        var data_B_ScaleX = generate_sample(sample_mean_B_scaleX, sample_stdDev_B_scaleX, sample_B_scaleX_min, sample_B_scaleX_max, sample_size_B);
        var data_B_ScaleY = generate_sample(sample_mean_B_scaleY, sample_stdDev_B_scaleY, sample_B_scaleY_min, sample_B_scaleY_max, sample_size_B);

        // Aggregate the scale values (x,y) for each of the two variables (A,B)
        data_A = pair_x_y (data_A_ScaleX, data_A_ScaleY);
        data_B = pair_x_y (data_B_ScaleX, data_B_ScaleY);
    }

    // set scatter-datasets
    var datasets = [
        {   
            // xy-pairs for var A
            label: label_A,
            data: data_A,
            backgroundColor: color_A,
            type: 'scatter',
            dragData: false,
        },
        {
            // xy-pairs for var B
            label: label_B,
            data: data_B,
            backgroundColor: color_B,
            type: 'scatter',
            dragData: false,
        },
    ]

    //set the data & Axis labels
    scatterChart.data.datasets = datasets;
    scatterChart.options.scales.x.title.text = label_scale_X;
    scatterChart.options.scales.y.title.text = label_scale_Y;
    scatterChart.update();

    // if the function is called by example-picker-dropdown, generate separator-line, if the function is called by the "Draw new Sample"-Buttton, do nothing
    if (status == 'inital') {
        //set line diagram (delayed, because diagram must be rendered first), with regression data
        data_C = linear_regression();
    } else if (status == 'secondary') {
        //set line diagram (delayed, because diagram must be rendered first), with the position put in by the user
        // get min & max value of the x axis
        var x_axis_min = scatterChart.scales.x.min
        var x_axis_max = scatterChart.scales.x.max
        // calc y-values for min & max values of x axis
        var ay = x_axis_min * separator_m + separator_b
        var by = x_axis_max * separator_m + separator_b
        data_C = [{x: x_axis_min, y: ay},{x: x_axis_max, y: by}]
    }

    datasets.push(
        {
            // xy-pairs for blue line
            label: 'none',
            data: data_C,
            borderColor: '#3366FF',
            type: 'line',
            fill: false,
            dragData: true,
            pointRadius: 6,
            borderCapStyle: 'round',
            pointHitRadius: 25
        },
    )

    scatterChart.data.datasets = datasets;
    scatterChart.update();

    if (example == 2) {
        datasets.push(
            {
                // xy-pairs additional markings in the plot
                label: 'female candidates',
                data: ext_data.data_overlay,
                borderColor: 'black',
                backgroundColor: 'transparent',
                pointStyle: 'round',
                pointRadius: 3.5,
                borderWidth: 1.5,
                dragData: false,
            },
        )
    
        scatterChart.data.datasets = datasets;
        scatterChart.update();
    }

    // activate buttons & text
    activate_interface(example); 

    // calc speci & sensi
    calc();

    // Adapt the content of the popovers to the example
    set_popover_content ()

    // resize canvas
    resize_canvas();
}

// calc the linear equation (blue line) and reset point depending on calulated variable to axis values
function determine_equation() {
    
    // get the data Points from the chart-object
    var ax = scatterChart.data.datasets[2].data[0].x
    var ay = scatterChart.data.datasets[2].data[0].y
    var bx = scatterChart.data.datasets[2].data[1].x
    var by = scatterChart.data.datasets[2].data[1].y

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
    var x_axis_min = scatterChart.scales.x.min
    var x_axis_max = scatterChart.scales.x.max

    // calc y-values for min & max values of x axis
    var ay = x_axis_min * m + b
    var by = x_axis_max * m + b
    new_coordinates = [{x_value: x_axis_min, y_value: ay},{x_value: x_axis_max, y_value: by}]
}

// generate a aprox normal distirbuted sample wit n = sample_size
function generate_sample(sample_mean, sample_stdDev, sample_min, sample_max, sample_size) {
    var sample = [];
    while (sample.length < sample_size) {
        
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Ensure that u is not 0
        while (v === 0) v = Math.random(); // Ensure that v is not 0
    
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const result = sample_mean + sample_stdDev * z;

        // Überprüfe, ob der Wert innerhalb des gewünschten Bereichs liegt
        if ((sample_min === null || result >= sample_min) && (sample_max === null || result <= sample_max)) {
            sample.push(result);
        }
    }
    return sample;
}

// stich pairs of values together in an object, an return those as an array
function pair_x_y (x, y) {
    var data = []
    for (var i in x) {
        var result = {x: x[i], y: y[i]}
        data.push(result)
    }
    return data;
}

// get the linear regression to describe the trends of the data
function linear_regression() {
    // Combine the two arrays depending on the example
    var data = [].concat(data_A,data_B)
    
    // calc means of x and y
    let sum_X = 0;
    let sum_Y = 0;
    for (let i = 0; i < data.length; i++) {
        sum_X += data[i].x;
        sum_Y += data[i].y;
    }
    const mean_X = sum_X / data.length;
    const mean_Y = sum_Y / data.length;

    // calc slope (m) & intercept (b)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < data.length; i++) {
        const x_Diff = data[i].x - mean_X;
        const y_Diff = data[i].y - mean_Y;
        numerator += x_Diff * y_Diff;
        denominator += x_Diff * x_Diff;
    }
    const m = numerator / denominator;
    separator_m = m //set to global var
    const b = mean_Y - m * mean_X;
    separator_b = b //set to global var

    // Calc Points for the separator
    // get min & max value of the x axis
    var x_axis_min = scatterChart.scales.x.min
    var x_axis_max = scatterChart.scales.x.max
    // calc y-values for min & max values of x axis
    var ay = x_axis_min * m + b
    var by = x_axis_max * m + b

    var result = [{x: x_axis_min, y: ay},{x: x_axis_max, y: by}]
    return result;
}

//reset the separator-line on button click
function reset_separator () {
    scatterChart.data.datasets[2].data = linear_regression();
    scatterChart.update();
    calc();
}

function calc () {
    // get data from X (A) & Y (B), depending on the example
    var data_X = scatterChart.data.datasets[0].data
    var data_Y = scatterChart.data.datasets[1].data

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

    // Fill in contingency-table depending on the example
    var example = document.getElementById('pick_example').value
    
    var con_table_X = {total: sample_size_A + sample_size_B, actual_group_A: sample_size_A, actual_group_B: sample_size_B, results_pos: 0, results_neg: 0, true_pos: 0, false_pos: 0, true_neg: 0, false_neg: 0}
    var con_table_Y = {total: sample_size_A + sample_size_B, actual_group_A: sample_size_A, actual_group_B: sample_size_B, results_pos: 0, results_neg: 0, true_pos: 0, false_pos: 0, true_neg: 0, false_neg: 0}
    
    if (example == 1) {
        //cats below & dogs above
        // Con-Table for Cats (X/A)
        con_table_X.true_pos = num_below_X
        con_table_X.false_pos = num_below_Y
        con_table_X.true_neg = num_above_Y
        con_table_X.false_neg = num_above_X
        con_table_X.results_pos = con_table_X.true_pos + con_table_X.false_pos
        con_table_X.results_neg = con_table_X.true_neg + con_table_X.false_neg

        // Con-Table for Dogs (Y/B)
        con_table_Y.true_pos = num_above_Y
        con_table_Y.false_pos = num_above_X
        con_table_Y.true_neg = num_below_X
        con_table_Y.false_neg = num_below_Y
        con_table_Y.results_pos = con_table_Y.true_pos + con_table_Y.false_pos
        con_table_Y.results_neg = con_table_Y.true_neg + con_table_Y.false_neg

    } else if (example == 2 || 3) {
        //Woman & Man
        // Con-Table for Woman | Ill (X/A)
        con_table_X.true_pos =  num_above_X
        con_table_X.false_pos =  num_above_Y
        con_table_X.true_neg =  num_below_Y
        con_table_X.false_neg =  num_below_X
        con_table_X.results_pos = con_table_X.true_pos + con_table_X.false_pos
        con_table_X.results_neg = con_table_X.true_neg + con_table_X.false_neg

        // Con-Table for Man | healthy (Y/B)
        con_table_Y.true_pos = num_below_Y
        con_table_Y.false_pos = num_below_X
        con_table_Y.true_neg = num_above_X
        con_table_Y.false_neg = num_above_Y
        con_table_Y.results_pos = con_table_Y.true_pos + con_table_Y.false_pos
        con_table_Y.results_neg = con_table_Y.true_neg + con_table_Y.false_neg
    }

    // show the data in the html table
    // Table for Var A
    document.getElementById('con_table_A_true_pos').innerHTML = con_table_X.true_pos
    document.getElementById('con_table_A_false_pos').innerHTML = con_table_X.false_pos
    document.getElementById('con_table_A_true_neg').innerHTML = con_table_X.true_neg
    document.getElementById('con_table_A_false_neg').innerHTML = con_table_X.false_neg
    document.getElementById('con_table_A_VarA_n').innerHTML = con_table_X.actual_group_A
    document.getElementById('con_table_A_VarB_n').innerHTML = con_table_X.actual_group_B
    document.getElementById('con_table_A_pos_results_n').innerHTML = con_table_X.results_pos
    document.getElementById('con_table_A_neg_results_n').innerHTML = con_table_X.results_neg

    // Table for Var B
    document.getElementById('con_table_B_true_pos').innerHTML = con_table_Y.true_pos
    document.getElementById('con_table_B_false_pos').innerHTML = con_table_Y.false_pos
    document.getElementById('con_table_B_true_neg').innerHTML = con_table_Y.true_neg
    document.getElementById('con_table_B_false_neg').innerHTML = con_table_Y.false_neg
    document.getElementById('con_table_B_VarA_n').innerHTML = con_table_Y.actual_group_A
    document.getElementById('con_table_B_VarB_n').innerHTML = con_table_Y.actual_group_B
    document.getElementById('con_table_B_pos_results_n').innerHTML = con_table_Y.results_pos
    document.getElementById('con_table_B_neg_results_n').innerHTML = con_table_Y.results_neg

    // calc Speci & Sensi
    var to_calc = [];
    var elems = [];
    var results = [
        {name: "sensi", elem_A: document.getElementById('sensA'), elem_B: document.getElementById('sensB'), value_A: null, value_B: null},
        {name: "speci", elem_A: document.getElementById('specA'), elem_B: document.getElementById('specB'), value_A: null, value_B: null},
        {name: "miss", elem_A: document.getElementById('missA'), elem_B: document.getElementById('missB'), value_A: null, value_B: null},
        {name: "fale", elem_A: document.getElementById('faleA'), elem_B: document.getElementById('faleB'), value_A: null, value_B: null},
        {name: "ppv", elem_A: document.getElementById('ppvA'), elem_B: document.getElementById('ppvB'), value_A: null, value_B: null},
        {name: "npv", elem_A: document.getElementById('npvA'), elem_B: document.getElementById('npvB'), value_A: null, value_B: null},
        {name: "fdr", elem_A: document.getElementById('fdrA'), elem_B: document.getElementById('fdrB'), value_A: null, value_B: null},
        {name: "for", elem_A: document.getElementById('forA'), elem_B: document.getElementById('forB'), value_A: null, value_B: null},
        {name: "plr", elem_A: document.getElementById('plrA'), elem_B: document.getElementById('plrB'), value_A: null, value_B: null},
        {name: "nlr", elem_A: document.getElementById('nlrA'), elem_B: document.getElementById('nlrB'), value_A: null, value_B: null},
        {name: "dodds", elem_A: document.getElementById('doddsA'), elem_B: document.getElementById('doddsB'), value_A: null, value_B: null},
        {name: "youden", elem_A: document.getElementById('youdenA'), elem_B: document.getElementById('youdenB'), value_A: null, value_B: null},
        {name: "accu", elem_A: document.getElementById('accuA'), elem_B: document.getElementById('accuB'), value_A: null, value_B: null},
        {name: "f1", elem_A: document.getElementById('f1A'), elem_B: document.getElementById('f1B'), value_A: null, value_B: null},
    ];

    /** get info on which values to calc **/
    var checkboxes = [
        {cb:1 , class: "visability_sensi_speci" , calc: ["sensi", "speci"]},
        {cb:2 , class: "visability_miss_fale" , calc: ["miss", "fale"]},
        {cb:3 , class: "visability_ppv_npv" , calc: ["ppv", "npv"]},
        {cb:4 , class: "visability_fdr_for" , calc: ["fdr", "for"]},
        {cb:5 , class: "visability_plr_nlr" , calc: ["sensi", "speci","miss", "fale","plr", "nlr"]},
        {cb:6 , class: "visability_dodds_youden" , calc: ["sensi", "speci","miss", "fale","plr", "nlr","dodds", "youden"]},
        {cb:7 , class: "visability_accu_F1" , calc: ["accu", "f1"]},
    ];
    
    // get all elems 
    for (var i in checkboxes) {
        var found_elems = document.querySelectorAll("." + checkboxes[i].class);
            elems.push(found_elems[0])
    }

    // check if elems are visible, if yes push name of the value to calc into the to_calc var
    for (var i in elems) {
        if (elems[i].style.display !== "none") {
            for (var j in checkboxes) {
                if (elems[i].classList.contains(checkboxes[j].class)) {
                    for (var k in checkboxes[j].calc) {
                        if(!to_calc.includes(checkboxes[j].calc[k])) {
                            to_calc.push(checkboxes[j].calc[k])
                        }   
                    }
                }
            }
        }
    }

    /** calc selected metrics **/
    // calc values for each selected metric by iteratring through the to_calc array and writing the results into results array
    for (var i in to_calc) {
        if (to_calc[i] == "sensi") {
            results[0].value_A = con_table_X.true_pos / con_table_X.actual_group_A
            results[0].value_B = con_table_Y.true_pos / con_table_Y.actual_group_B
        } else if (to_calc[i] == "speci") {
            results[1].value_A = con_table_X.true_neg / con_table_X.actual_group_B
            results[1].value_B = con_table_Y.true_neg / con_table_Y.actual_group_A
        } else if (to_calc[i] == "miss") {
            results[2].value_A = con_table_X.false_neg / con_table_X.actual_group_A
            results[2].value_B = con_table_Y.false_neg / con_table_Y.actual_group_B
        } else if (to_calc[i] == "fale") {
            results[3].value_A = con_table_X.false_pos / con_table_X.actual_group_B
            results[3].value_B = con_table_Y.false_pos / con_table_Y.actual_group_A
        } else if (to_calc[i] == "ppv") {
            results[4].value_A = con_table_X.true_pos / con_table_X.results_pos
            results[4].value_B = con_table_Y.true_pos / con_table_Y.results_pos
        } else if (to_calc[i] == "npv") {
            results[5].value_A = con_table_X.true_neg / con_table_X.results_neg
            results[5].value_B = con_table_Y.true_neg / con_table_Y.results_neg
        } else if (to_calc[i] == "fdr") {
            results[6].value_A = con_table_X.false_pos / con_table_X.results_pos
            results[6].value_B = con_table_Y.false_pos / con_table_Y.results_pos
        } else if (to_calc[i] == "for") {
            results[7].value_A = con_table_X.false_neg / con_table_X.results_neg
            results[7].value_B = con_table_Y.false_neg / con_table_Y.results_neg
        } else if (to_calc[i] == "plr") {
            results[8].value_A = results[0].value_A / (1 - results[1].value_A)
            results[8].value_B = results[0].value_B / (1 - results[1].value_B)
        } else if (to_calc[i] == "nlr") {
            results[9].value_A = (1 - results[0].value_A) / results[1].value_A
            results[9].value_B = (1 - results[0].value_B) / results[1].value_B
        } else if (to_calc[i] == "dodds") {
            results[10].value_A = results[8].value_A / results[9].value_A
            results[10].value_B = results[8].value_B / results[9].value_B
        } else if (to_calc[i] == "youden") {
            results[11].value_A = results[0].value_A + results[1].value_A -1
            results[11].value_B = results[0].value_B + results[1].value_B -1
        } else if (to_calc[i] == "accu") {
            results[12].value_A = (con_table_X.true_pos + con_table_X.true_neg) / con_table_X.total
            results[12].value_B = (con_table_Y.true_pos + con_table_Y.true_neg) / con_table_Y.total
        } else if (to_calc[i] == "f1") {
            results[13].value_A = (2 * con_table_X.true_pos) / (2 * con_table_X.true_pos + con_table_X.false_pos + con_table_X.false_neg)
            results[13].value_B = (2 * con_table_Y.true_pos) / (2 * con_table_Y.true_pos + con_table_Y.false_pos + con_table_Y.false_neg)
        } 
    }

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

        if (results[i].value_B == null || isNaN(results[i].value_B)) {
            results[i].elem_B.innerHTML = placeholder_not_possible
        } else if (!isFinite(results[i].value_A)) {
            results[i].elem_A.innerHTML = placeholder_not_possible
        } else {
            results[i].elem_B.innerHTML = Math.round(results[i].value_B * 100) /100
        }
    }
}

// function to let users pic whch metrics to display
function set_metrics(checkbox) {
    var checkboxes = [
        {cb:1 , class: "visability_sensi_speci"},
        {cb:2 , class: "visability_miss_fale"},
        {cb:3 , class: "visability_ppv_npv"},
        {cb:4 , class: "visability_fdr_for"},
        {cb:5 , class: "visability_plr_nlr"},
        {cb:6 , class: "visability_dodds_youden"},
        {cb:7 , class: "visability_accu_F1"},
    ];

    //check if elem is visible, if not show, if yes hide
    var elems = document.querySelectorAll("." + checkboxes[checkbox-1].class);
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].style.display === "none") {
            elems[i].style.display = "";
        } else {
            elems[i].style.display = "none";
        }
    }

    //Resize the chart canvas, and calc the results (if an example is picked)
    resize_canvas();
    if (document.getElementById('pick_example').value !== "0") {
        calc();
    }
}


/***✨Beauty-Stuff✨***/
// Resize Canvas
window.addEventListener('resize', resize_canvas);
resize_canvas();
function resize_canvas () {
    var tests_container_elem_height = document.getElementById('tests_container').clientHeight;
    var button_height = 31//document.getElementById('btn_reset_separator').clientHeight;
    var canvas_elem = document.getElementById('chart_container_inner')

    // check width, to determine if orientation is horizontal (e.g. the "results" are displayed on the left, not below the chart)
    if (window.innerWidth >= 1200) {
        canvas_elem.style.height = tests_container_elem_height - button_height +"px"
    } else if (window.innerWidth >= 992) {
        canvas_elem.style.height = "500px"
    } else {
        canvas_elem.style.height = "300px"
    }
    
}

// change cursor on hover
function change_cursor_on_hover(mousemove) {
    const cursor_position = scatterChart.getElementsAtEventForMode(mousemove, 'nearest', {intersect: true}, true);

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

scatterChart.canvas.addEventListener('mousemove', (e) => {
        change_cursor_on_hover(e);
})

// Hide "Pick an Example" from the selection elem when a different option is picked
let firstOptionRemoved = false;
function removeFirstOption() {
    const selectElement = document.getElementById('pick_example');
    
    if (!firstOptionRemoved) {
        selectElement.removeChild(selectElement.options[0]);
        firstOptionRemoved = true;
    }
}

// activate the buttons & replace Headlines, Text when an example is picked by the user
function activate_interface(example) {
    //replace text depending on the example
    var elems = [document.getElementById('content-0'), document.getElementById('content-1'), document.getElementById('content-2'), document.getElementById('content-3')]
    for (var i in elems) {
        if (i == example) {
            elems[i].style = "display: true;"
        } else {
            elems[i].style = "display: none;"
        }
    }

    // Replace headlines for sensi & speci cards
    document.getElementById('var_title_A').innerHTML = label_A;
    document.getElementById('con_table_A_VarA').innerHTML = label_A;
    document.getElementById('con_table_B_VarA').innerHTML = label_A;
    document.getElementById('con_table_A_pos_results').innerHTML = label_A;
    document.getElementById('con_table_A_neg_results').innerHTML = label_B;
    
    document.getElementById('var_title_B').innerHTML = label_B;
    document.getElementById('con_table_A_VarB').innerHTML = label_B;
    document.getElementById('con_table_B_VarB').innerHTML = label_B;
    document.getElementById('con_table_B_pos_results').innerHTML = label_B;
    document.getElementById('con_table_B_neg_results').innerHTML = label_A;


    // Set Buttons to active
    if (example == 1 || example == 3) {
        var button_ids = ['btn_reset_separator', 'btn_generate_sample']
        for (var i in button_ids) {
            document.getElementById(button_ids[i]).disabled = false;
        }
    } else {
        document.getElementById("btn_reset_separator").disabled = false;
        document.getElementById("btn_generate_sample").disabled = true;
    }
}

// Set Popover content depending on the title
set_popover_content ()
function set_popover_content () {
    // define the content (defintion, synonyms, calculation) for the popovers
    var content = [
        /*Sensitivity*/
        {
            definition: "Sensitivität gibt die Wahrscheinlichkeit eines positiven Testergebnisses an, wenn das Kriterium tatsächlich zutrifft.", 
            synonyms: "Sensitivity, Recall, Power (1-β), Richtig-positiv-Rate, Trefferrate, Detektionswahrscheinlichkeit.", 
            calculation: '<span class="popover_calc_color_TP">TP</span> / <span class="popover_calc_color_P">P</span>'
        },
        /*Specificity*/
        {
            definition: "Spezifität gibt die Wahrscheinlichkeit eines negativen Testergebnisses an, wenn das Kriterium nicht zutrifft.", 
            synonyms: "Specificity, Richtig-negativ-Rate, Selektivität.", 
            calculation: '<span class="popover_calc_color_TN">TN</span> / <span class="popover_calc_color_N">N</span>'
        },
        /*Miss Rate*/
        {
            definition: "Die Falsch-negativ-Rate gibt die Wahrscheinlichkeit eines negativen Testergebnisses an, wenn das Kriterium tatsächlich zutrifft.", 
            synonyms: "Miss Rate, β", 
            calculation: '<span class="popover_calc_color_FN">FN</span> / <span class="popover_calc_color_P">P</span>'
        },
        /*False Alarm Rate*/
        {
            definition: "Die Falsch-positiv-Rate gibt die Wahrscheinlichkeit eines positiven Testergebnisses an, wenn das Kriterium nicht zutrifft.", 
            synonyms: "False Alarm Rate, Ausfallrate", 
            calculation: '<span class="popover_calc_color_FP">FP</span> / <span class="popover_calc_color_N">N</span>'
        },
        /*Positive Predictive Value*/
        {
            definition: "Der positive Vorhersagewert gibt die Wahrscheinlichkeit an, dass das Kriterium tatsächlich zutrifft, wenn ein positives Testergebnis vorliegt.", 
            synonyms: "Positive Predictive Value, Genauigkeit, Wirksamkeit, positiver prädiktiver Wert", 
            calculation: '<span class="popover_calc_color_TP">TP</span> / <span class="popover_calc_color_PP">PP</span>'
        },
        /*Negative Predictive Value*/
        {
            definition: "Der negative Vorhersagewert gibt die Wahrscheinlichkeit an, dass das Kriterium nicht zutrifft, wenn ein negatives Testergebnis vorliegt.", 
            synonyms: "Negative Predictive Value, Segreganz, Trennfähigkeit", 
            calculation: '<span class="popover_calc_color_TN">TN</span> / <span class="popover_calc_color_PN">PN</span>'
        },
        /*False Discovery Rate*/
        {
            definition: "Die Falschentdeckungsrate gibt die Wahrscheinlichkeit an, dass das Kriterium nicht zutrifft, wenn ein positives Testergebnis vorliegt.", 
            synonyms: "False Discovery Rate", 
            calculation: '<span class="popover_calc_color_FP">FP</span> / <span class="popover_calc_color_PP">PP</span>'
        },
        /*False Omission Rate*/
        {
            definition: "Die Falschauslassungsrate gibt die Wahrscheinlichkeit an, dass das Kriterium tatsächlich zutrifft, wenn ein negatives Testergebnis vorliegt.", 
            synonyms: "False Omission Rate", 
            calculation: '<span class="popover_calc_color_FN">FN</span> / <span class="popover_calc_color_PN">PN</span>'
        },
        /*Positive Likelihood Ratio*/
        {
            definition: "Die pos. Likelihood Ratio ist das Verhältnis zwischen der Wahrscheinlichkeit eines positiven Testergebnisses, wenn das Kriterium zutrifft und der Wahrscheinlichkeit eines positiven Testergebnisses, wenn das Kriterium nicht zutrifft. In anderen Worten: eine <i>größere</i> LR+ suggeriert, dass der Test effektiver im korrekten Erkennen von Individuen, auf die das Kriterium zutrifft.", 
            synonyms: "Positive Likelihood Ratio, LR+, Likelihood Ratio für positive Ergebnisse", 
            calculation: '<br>sensitivity / false alarm rate <br>= (<span class="popover_calc_color_TP">TP</span> / <span class="popover_calc_color_P">P</span>) / (<span class="popover_calc_color_FP">FP</span> / <span class="popover_calc_color_N">N</span>)'
        },
        /*Negative Likelihood Ratio*/
        {
            definition: "Die neg. Likelihood Ratio ist das Verhältnis zwischen der Wahrscheinlichkeit eines negativen Testergebnisses, wenn das Kriterium zutrifft und der Wahrscheinlichkeit eines negativen Testergebnisses, wenn das Kriterium nicht zutrifft.  In anderen Worten: eine <i>kleinere</i> LR- suggeriert, dass der Test effektiver im korrekten Erkennen von Individuen, auf die das Kriterium <i>nicht</i> zutrifft.", 
            synonyms: "Negative Likelihood Ratio, LR-, Likelihood Ratio für negative Ergebnisse", 
            calculation: '<br>miss rate / specificity <br>= (<span class="popover_calc_color_FN">FN</span> / <span class="popover_calc_color_P">P</span>) / (<span class="popover_calc_color_TN">TN</span> / <span class="popover_calc_color_N">N</span>)'
        },
        /*Accuracy*/
        {
            definition: 'Die Korrektklassifikationsrate ist ein Maß der Performanz des Tests. Zu diesem Zweck wird die Anzahl der richtigen Klassifikationen (beider Typen!) mit der Gesamtanzahl der Fälle verglichen. Die Korrektklassifikationsrate hängt von der Prävalenz des Kriteriums ab. Sie kann irreführend sein, wenn bspw. unausgeglichene Datensets verwendet werden, bei denen die Prävalenz des Kriteriums niedrig ist. In solchen Fällen wird eine hohe Korrektklassifikationsrate erreicht, indem die meisten Proben einfach als negativ klassifiziert werden.', 
            synonyms: "Accuracy", 
            calculation: '<br>True classifications / Σ cases <br>= (<span class="popover_calc_color_TP">TP</span> + <span class="popover_calc_color_TN">TN</span>) / (<span class="popover_calc_color_P">P</span> + <span class="popover_calc_color_N">N</span>)'
        },
        /*F1-Score*/
        {
            definition: "Das F<sub>1</sub>-Maß ist eine alternatives Maß der Korrektklassifikationsrate, das Sensitivität und den positiven Vorhersagewert in ein harmonisches Mittel kombiniert. Es wird oft im Machine Learning verwendet und ist speziell für den Fall von unbalancierten Gruppen nützlich.", 
            synonyms: "F1-Score, (balanciertes) F-Maß, F<sub>⁠β</sub>", 
            calculation: '<br>2 / (Sensitivity<sup>-1</sup> + PPV<sup>-1</sup>) <br>= 2 * <span class="popover_calc_color_TP">TP</span> / (2 * <span class="popover_calc_color_TP">TP</span> + <span class="popover_calc_color_FP">FP</span> + <span class="popover_calc_color_FN">FN</span>)'
        },
        /*Diagnostic Odds Ratio*/
        {
            definition: "Wie die Korrektklassifikationsrate (oder F1 & J) ist die diagn. Odds Ratio ein Maß der Performanz des Tests. Jedoch ist es unabhängig von der Prävalenz und wird als ein Chancenverhältnis berechnet. Es reicht von 0 - ∞. Dabei geben größere Werte (>1) eine bessere Performanz des Tests an.", 
            synonyms: "Diagnostic Odds Ratio", 
            calculation: '<br>Pos. likelihood ratio / Neg. likelihood ratio <br>= <b>(</b>sensitivity <b>/</b> false alarm rate<b>)</b> / <b>(</b>miss rate <b>/</b> specificity<b>)</b> <br>= <b>[</b>(<span class="popover_calc_color_TP">TP</span> / <span class="popover_calc_color_P">P</span>) <b>/</b> (<span class="popover_calc_color_FP">FP</span> / <span class="popover_calc_color_N">N</span>)<b>]</b> / <b>[</b>(<span class="popover_calc_color_FN">FN</span> / <span class="popover_calc_color_P">P</span>) <b>/</b> (<span class="popover_calc_color_TN">TN</span> / <span class="popover_calc_color_N">N</span>)<b>]</b>'
        },
        /*Youdens J*/
        {
            definition: "Youdens J ist ein weiteres Maß der Performanz des Tests. Youdens J kann nützlich sein, um Spezifität und Sensitivität auszugleichen. Das Maß reicht von 0 - 1, wobei ein höherer Wert eine bessere diskriminative Performanz des Tests angibt.", 
            synonyms: "Youdens Index", 
            calculation: '<br>sensitivity + sensitivity - 1 <br>= (<span class="popover_calc_color_TP">TP</span> / <span class="popover_calc_color_P">P</span>) + (<span class="popover_calc_color_TN">TN</span> / <span class="popover_calc_color_N">N</span>) - 1'
        },
    ]
    const definition_Elements = document.querySelectorAll('definition');
    var example = document.getElementById('pick_example').value

    // set the content of the popovers with variable example-text, depending on the example picked by the user
    var keywords = [
        {keyword: "Sensitivität", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[0].definition+'</div><div class="col-md-6 p-1"><b>Synonym</b>: '+content[0].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[0].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[0].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Katzen, die durch den Test tatsächlich als Katzen eingestuft wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[0].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[0].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[0].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der wahrscheinlich erfolgreichen Bewerber und Bewerberinen, die eingeladen werden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[0].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[0].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[0].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Patienten und Patientinnen mit einer Depression, die korrekt als solche von dem Test identifiziert wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[0].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[0].calculation+'</div></div>',
        ]},
        {keyword: "Spezifität", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[1].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[1].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[1].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[1].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Chihuahuas, die durch den Test tatsächlich als Chihuahuas eingestuft wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[1].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[1].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[1].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der wahrscheinlich erfolglosen Bewerber und Bewerberinnen, die nicht eingeladen werden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[1].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[1].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[1].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Patienten und Patientinnen mit einer Angststörung, die korrekt als solche von dem Test identifiziert wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[1].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[1].calculation+'</div></div>'
        ]},
        {keyword: "Falsch-negativ-Rate", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[2].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[2].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[2].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[2].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Katzen, die von dem Test als Chihuahuas eingestuft wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[2].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[2].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[2].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der wahrscheinlich erfolgreichen Bewerber und Bewerberinen , die nicht eingeladen werden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[2].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[2].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[2].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Patienten und Patientinnen mit einer Depression, die fälschlicherweise von dem Test als Patienten und Patientinnen mit einer Angststörung identifiziert wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[2].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[2].calculation+'</div></div>'
        ]},
        {keyword: "Falsch-positiv-Rate", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[3].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[3].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[3].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[3].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Chihuahuas, die von dem Test als Katzen eingestuft wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[3].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[3].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[3].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der wahrscheinlich erfolglosen Bewerber und Bewerberinnen, die eingeladen werden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[3].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[3].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[3].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil der Patienten und Patientinnen mit einer Angststörung, die fälschlicherweise von dem Test als Patienten und Patientinnen mit einer Depression identifiziert wurden.</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[3].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[3].calculation+'</div></div>'
        ]},
        {keyword: "Positiver Vorhersagewert", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[4].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[4].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[4].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[4].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiven Testergebnisse, bei denen es sich tatsächlich um Katzen handelt (Richtig positiv).</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[4].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[4].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[4].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiven Testergebnisse, die tatsächlich wahrscheinlich erfolgreiche Bewerber und Bewerberinnen darstellen (Richtig positive).</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[4].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[4].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[4].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiver Testergebnisse, die tatsächlich Patienten und Patientinnen mit einer Depression darstellen (Richtig positive).</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[4].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[4].calculation+'</div></div>'
        ]},
        {keyword: "Negativer Vorhersagewert", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[5].definition+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[5].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[5].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die tatsächlich Chihuahuas betreffen (Richtig negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[5].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[5].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die tatsächlich wahrscheinlich erfolglose Bewerber und Bewerberinnen darstellen (Richtig negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[5].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[5].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die tatsächlich Patienten und Patientinnen mit einer Angststörung darstellen (Richtig negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[5].calculation+'</div></div>'
        ]},
        {keyword: "Falscherkennungsrate", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[6].definition+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[6].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[6].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiven Testergebnisse, die <i>nicht</i> Katzen darstellen, sondern Chihuahuas (Falsch positiv).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[6].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[6].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiven Testergebnisse, die <i>nicht</i> wahrscheinlich erfolgreiche Bewerber und Bewerberinnen darstellen, sondern wahrscheinlich erfolglose Bewerber und Bewerberinnen (Falsch positiv).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[6].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[6].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller positiven Testergebnisse, die <i>nicht</i> Patienten und Patientinnen mit einer Depression darstellen, sondern Patienten und Patientinnen mit einer Angststörung (Falsch positiv).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[6].calculation+'</div></div>'
        ]},
        {keyword: "Falschauslassungsrate", content: [
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[7].definition+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[7].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[7].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die <i>nicht</i> Chihuahuas darstellen, sondern Katzen (Falsch negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[7].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[7].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die <i>nicht</i> wahrscheinlich erfolglose Bewerber und Bewerberinnen darstellen, sondern wahrscheinlich erfolgreiche Bewerber und Bewerberinnen (Falsch negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[7].calculation+'</div></div>',
            '<div class="row"><div class="col-md-6 p-1"><b>Definition</b>: '+content[7].definition+'</div><div class="col-md-6 p-1"><b>Beispiel</b>: Der Anteil aller negativen Testergebnisse, die <i>nicht</i> Patienten und Patientinnen mit einer Angststörung darstellen, sondern Patienten und Patientinnen mit einer Depression (Falsch negativ).</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[7].calculation+'</div></div>'
        ]},
        {keyword: "Positive Likelihood Ratio", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[8].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[8].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[8].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[8].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[8].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[8].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[8].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[8].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[8].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[8].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[8].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[8].calculation+'</div></div>'
        ]},
        {keyword: "Negative Likelihood Ratio", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[9].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[9].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[9].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[9].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[9].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[9].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[9].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[9].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[9].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[9].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[9].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[9].calculation+'</div></div>'
        ]},
        {keyword: "Korrektklassifikationsrate", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[10].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[10].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[10].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[10].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[10].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[10].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[10].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[10].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[10].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[10].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[10].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[10].calculation+'</div></div>'
        ]},
        {keyword: "F1-Wert", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[11].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[11].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[11].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[11].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[11].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[11].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[11].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[11].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[11].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[11].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[11].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[11].calculation+'</div></div>'
        ]},
        {keyword: "Diagnostisches Odds Ratio", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[12].definition+'</div><div class="col-md-12 p-1"><b>Berechnung</b>: '+content[12].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[12].definition+'</div><div class="col-md-12 p-1"><b>Berechnung</b>: '+content[12].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[12].definition+'</div><div class="col-md-12 p-1"><b>Berechnung</b>: '+content[12].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[12].definition+'</div><div class="col-md-12 p-1"><b>Berechnung</b>: '+content[12].calculation+'</div></div>'
        ]},
        {keyword: "Youden's J", content: [
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[13].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[13].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[13].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[13].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[13].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[13].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[13].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[13].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[13].calculation+'</div></div>',
            '<div class="row"><div class="col-md-12 p-1"><b>Definition</b>: '+content[13].definition+'</div><div class="col-md-6 p-1"><b>Synonyme</b>: '+content[13].synonyms+'</div><div class="col-md-6 p-1"><b>Berechnung</b>: '+content[13].calculation+'</div></div>'
        ]},
    ]

    // set the content of popovers
    definition_Elements.forEach((element) => {
        var originalTitle = element.getAttribute('data-bs-original-title');

        for (var i in keywords) {
            if (keywords[i].keyword == originalTitle) {
                element.setAttribute('data-bs-content', keywords[i].content[example]);
            }
        }
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
}

// render colorfull overlay in the contingency table, while defintion popovers are active
function show_colours_calc_table (status, metric) {
    var elems_a = [
        {name: "p", elem: document.getElementById("con_table_A_VarA_outer"), color: "#22b14c"},
        {name: "n", elem: document.getElementById("con_table_A_VarB_outer"), color: "#3f48cc"},
        {name: "pp", elem: document.getElementById("con_table_A_pos_results_outer"), color: "#ede102"},
        {name: "pn", elem: document.getElementById("con_table_A_neg_results_outer"), color: "#ed1c24"},
        {name: "tp", elem: document.getElementById("con_table_A_true_pos"), color: "#b5e61d"},
        {name: "fp", elem: document.getElementById("con_table_A_false_pos"), color: "#00a2e8"},
        {name: "fn", elem: document.getElementById("con_table_A_false_neg"), color: "#ff7f27"},
        {name: "tn", elem: document.getElementById("con_table_A_true_neg"), color: "#a349a4"},
    ]
    var elems_b = [
        {name: "p", elem: document.getElementById("con_table_B_VarB_outer"), color: "#22b14c"},
        {name: "n", elem: document.getElementById("con_table_B_VarA_outer"), color: "#3f48cc"},
        {name: "pp", elem: document.getElementById("con_table_B_pos_results_outer"), color: "#ede102"},
        {name: "pn", elem: document.getElementById("con_table_B_neg_results_outer"), color: "#ed1c24"},
        {name: "tp", elem: document.getElementById("con_table_B_true_pos"), color: "#b5e61d"},
        {name: "fp", elem: document.getElementById("con_table_B_false_pos"), color: "#00a2e8"},
        {name: "fn", elem: document.getElementById("con_table_B_false_neg"), color: "#ff7f27"},
        {name: "tn", elem: document.getElementById("con_table_B_true_neg"), color: "#a349a4"},
    ]

    var elems_to_show = []

    if (metric == "sens") {
        elems_to_show.push("tp", "p")

    } else if (metric == "speci") {
        elems_to_show.push("tn", "n")

    } else if (metric == "missrate") {
        elems_to_show.push("fn", "p")

    } else if (metric == "fale") {
        elems_to_show.push("fp", "n")

    } else if (metric == "ppv") {
        elems_to_show.push("tp", "pp")

    } else if (metric == "npv") {
        elems_to_show.push("tn", "pn")

    } else if (metric == "fdr") {
        elems_to_show.push("fp", "pp")

    } else if (metric == "for") {
        elems_to_show.push("fn", "pn")

    } else if (metric == "plr") {
        elems_to_show.push("tp", "p", "fp", "n")

    } else if (metric == "nlr") {
        elems_to_show.push("fn", "p", "tn", "n")

    } else if (metric == "diag") {
        elems_to_show.push("tp", "p", "fp", "n", "fn", "tn")

    } else if (metric == "youden") {
        elems_to_show.push("tp", "p", "tn", "n")

    } else if (metric == "accu") {
        elems_to_show.push("tp", "tn", "p", "n")

    } else if (metric == "f1") {
        elems_to_show.push("tp", "fp","fn")

    }

    if (status == "show") {
        for (var i in elems_to_show) {
            for (var j in elems_a) {
                if (elems_a[j].name == elems_to_show[i]) {
                    elems_a[j].elem.style.color = elems_a[j].color
                }
            }
            for (var j in elems_b) {
                if (elems_b[j].name == elems_to_show[i]) {
                    elems_b[j].elem.style.color = elems_b[j].color
                }
            }
        }
    } else {
        for (var i in elems_a) {
            elems_a[i].elem.style.color = ""
        }
        for (var q in elems_b) {
            elems_b[q].elem.style.color = ""
        }
    }
}

function cat_easteregg () {
    console.log("meow")
    var elem = document.getElementById("easteregg")
    elem.innerHTML = "cats 🐈"
}