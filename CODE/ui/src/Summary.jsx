import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell} from 'recharts';

// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x) => {
  return (x || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const maxYear = 2017;
const minYear = 1992;
const validYears = []
for (let y = minYear; y <= maxYear; y++) {
  validYears.push(y)
}

const CustomTooltip  = React.createClass({
  // propTypes: {
  //   type: React.PropTypes.string,
  //   payload: React.PropTypes.array,
  //   label: React.PropTypes.string,
  // },


  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      //console.log(payload)
      return (
        <div className="custom-tooltip">
        {payload && payload.length === 1 ?
          <div>
           {(payload[0].value + '') !== "0"
            ?
            <div>
              <h6 className="label">{label + " " + _.capitalize(payload[0].dataKey.split("_").join(" ")) + ": "}</h6>
              <label>{numberWithCommas(payload[0].value) + ""}</label>
            </div> :
            <div><h6>No data</h6></div>
            }
          </div>
        :
        <div>
         <h6 className="label">{label}</h6>
         <div>
          <h6 className="label">{ _.capitalize(payload[0].dataKey.split("_").join(" ")) + ": "}
              <small>{numberWithCommas(payload[0].value || 0) + ""}</small>
          </h6>
         </div>
         <div>
          <h6 className="label">{ _.capitalize(payload[1].dataKey.split("_").join(" ")) + ": "}
              <small>{numberWithCommas(payload[1].value || 0) + ""}</small>
          </h6>
         </div>
         <div>
          <h6 className="label">{ _.capitalize(payload[2].dataKey.split("_").join(" ")) + ": "}
              <small>{numberWithCommas(payload[2].value || 0) + ""}</small>
          </h6>
         </div>

        </div>

        }
        </div>
      );
    }

    return null;
  }
});



class Summary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      countDataKey : 'Prescriptions',
      selectedDrug : {},
      drugData : [],
      drugCounts : [],
      eventData : [],
      articles : []
    };
    this.loadByDrugCounts = this.loadByDrugCounts.bind(this);
    this.loadInitData = this.loadInitData.bind(this);
    this.loadAeData = this.loadAeData.bind(this);
    this.loadEventData = this.loadEventData.bind(this);
  }

  componentDidMount() {
    this.loadInitData();
  }

  loadInitData() {
    axios.get("./data/medicaid_overall.json")
      .then((response) => {
        if (response.data) {
          let drugData = [];
          let years = {}
          response.data.forEach((d) => {
            years[+d.year] = 1
            drugData.push({
              name : d.year,
              Year : +d.year,
              Prescriptions : d.sum
            });

          });
          validYears.forEach(y => {
            if (!years[y]) {
              drugData.push({
                name : y + '',
                Year : y,
                Prescriptions : 0
              });
            }
          })
          this.setState({ drugData : _.sortBy(drugData, ['Year'])});
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDrug &&
      this.state.selectedDrug.concept_name !== nextProps.selectedDrug.concept_name) {
      this.setState({
        selectedDrug : nextProps.selectedDrug,
        eventData : [],
        drugData : [],
        articles : []
      });
    }
    this.setState({
      drugCounts : nextProps.drugCounts
    }, () => { this.loadByDrugCounts(nextProps.drugCounts)});
    if (_.isEmpty(nextProps.selectedDrug.concept_name)) {
      this.loadInitData();
    }
    if (!_.isEmpty(nextProps.aeData)) {
      this.loadAeData(nextProps.aeData);
    }
    if (!_.isEmpty(nextProps.eventData)) {
      this.loadEventData(nextProps.eventData);
    }
  }

  loadAeData(aeData) {
    let m = {};
    let events = [];
    aeData.forEach(d => {
      let key = "other_reactions";
      if (d.outc_cod === "HO") {
        key = "hospitalizations"
      } else if (d.outc_cod === "DE") {
        key = "deaths"
      }

      if (!m[key]) {
        m[key] = {}

      }
      const year = d.datestr.substring(0, 4)
      if (!m[key][year]) {
        m[key][year] = 0;
      }
      m[key][year] += +d.num;
    });

    (Object.keys(m)).forEach(t => {
      const obj = m[t];
      Object.keys(obj).forEach(y => {
        let evt = {
          name : y,
          Year : +y,
          vKey : t
        };
        evt[t] = +obj[y];
        events.push(evt)
      });

    });
    this.setState(prevState => ({
      eventData: _.sortBy(events, ['Year', 'vKey'])
    }));
  }

  loadEventData(eventData) {
    let events = [];
    let m = {};

    (eventData).forEach(d => {
      if (d.event_type === "ARTICLE") {
        const y = d.date.substring(0,4);
        let key = "neutral"
        let score = d.sentiment_neu || 0.0;
        if (d.sentiment_neg && d.sentiment_neg > score) {
          key = "negative";
          score = d.sentiment_neg;
        }
        if (d.sentiment_pos && d.sentiment_pos > score) {
          key = "positive";
          score = d.sentiment_pos;
        }
        if (!m[y]) {
          m[y] = {};
        }
        if (!m[y][key]) {
          m[y][key] = 0;
        }
        m[y][key] += 1;
      }

    });
    validYears.forEach(y => {
      if (!m[y]) {
        m[y] = {};
        m[y].neutral = 0;
        m[y].positive = 0;
        m[y].negative = 0;
      }
    });

    (Object.keys(m)).forEach(i => {
      let evt = {
        name : i,
        Year : +i,
        neutral : m[i].neutral || 0,
        positive : m[i].positive || 0,
        negative : m[i].negative || 0
      };

      events.push(evt)
    });
    //console.log(events);
    this.setState(prevState => ({
      articles: _.sortBy(events, ['Year'])
    }));
  }

  loadByDrugCounts(drugCounts) {
    let drugData = [];
    let years = {}
    drugCounts.forEach((d) => {
      years[+d.year] = 1;
      drugData.push({
        name : d.year,
        Year : +d.year,
        Prescriptions : d.prescriptions
      });
    });
    validYears.forEach(y => {
      if (!years[y]) {
        drugData.push({
          name : y + '',
          Year : y,
          Prescriptions : 0
        });
      }
    })
    this.setState({ drugData : _.sortBy(drugData, ['Year'])});
  }



  render() {
    return (
      <div className="summary-div">

          <h5 style={{color:"gray", textAlign: "center"}}>
            {!_.isEmpty(this.state.selectedDrug.concept_name) ?
              this.state.selectedDrug.concept_name :
              "All Medications"
            }
          </h5>
          <h6 style={{color:"gray", textAlign: "center"}}>
            Prescriptions
          </h6>
        <ResponsiveContainer height={160}>
          <BarChart  data={this.state.drugData}
                margin={{top: 20, right: 30, left: 20, bottom: 5}}>
           <XAxis dataKey="name" type="category"/>
           <YAxis type="number"/>
           <CartesianGrid strokeDasharray="3 3"/>
           <Tooltip content={<CustomTooltip/>}/>
           <Bar dataKey="Prescriptions" fill="#1F9BCF">
            {
               this.state.drugData.map((entry, index) => {
                 const color = +entry.Year === +this.props.selectedYear ? "#FF471C" : "#1F9BCF";
                 return <Cell key={index} fill={color} />;
               })
             }
            </Bar>
          </BarChart>

        </ResponsiveContainer>
        {!_.isEmpty(this.props.selectedDrug.concept_name) ?
        <div style={{zIndex:150}}>


            <h6 style={{color:"gray", textAlign: "center", margin: "0"}}>
              Media Coverage
            </h6>
              <ResponsiveContainer height={160} style={{zIndex: 3}}>

                <BarChart data={this.state.articles}
                      margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                 <XAxis dataKey="name" type="category"/>
                 <YAxis type="number"/>
                 <CartesianGrid strokeDasharray="3 3"/>
                 <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="positive" stackId="a" fill="#f0ad4e" barSize={4}>
                     {
                        this.state.articles.map((entry, index) => {
                          const color = +entry.Year === +this.props.selectedYear ? "#FF471C" : "#f0ad4e";
                          return <Cell key={index} fill={color} />;
                        })
                      }
                     </Bar>
                     <Bar dataKey="negative" stackId="a" fill="#d9534f" barSize={4}>
                      {
                         this.state.articles.map((entry, index) => {
                           const color = +entry.Year === +this.props.selectedYear ? "#FF471C" : "#d9534f";
                           return <Cell key={index} fill={color} />;
                         })
                       }
                      </Bar>
                      <Bar dataKey="neutral" stackId="a" fill="#f0ad4e" barSize={4}>
                       {
                          this.state.articles.map((entry, index) => {
                            const color = +entry.Year === +this.props.selectedYear ? "#FF471C" : "#f0ad4e";
                            return <Cell key={index} fill={color} />;
                          })
                        }
                       </Bar>

                </BarChart>
              </ResponsiveContainer>


              <h6 style={{color:"gray", textAlign: "center", margin: "0"}}>
                Adverse Events
              </h6>
              <ResponsiveContainer height={220} style={{zIndex: 3}}>

                <BarChart data={this.state.eventData}
                      margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                 <XAxis dataKey="name" type="category"/>
                 <YAxis type="number"/>
                 <CartesianGrid strokeDasharray="3 3"/>
                <Legend />
                 <Tooltip content={<CustomTooltip/>}/>
                 <Bar dataKey="deaths" fill="black"  barSize={4}>
                </Bar>
                 <Bar dataKey="hospitalizations" fill="#f0ad4e"  barSize={4}>
                  </Bar>
                <Bar dataKey="other_reactions" fill="#d9534f"  barSize={4}>
                 </Bar>
                </BarChart>
              </ResponsiveContainer>
        </div>

        : <span /> }
      </div>
    );
  };
}

export default Summary;
