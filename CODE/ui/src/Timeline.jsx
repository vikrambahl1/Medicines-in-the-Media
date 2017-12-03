import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import VisTimeline from 'react-visjs-timeline'

const start = 1992
const end = 2017

const options = {
  start : (start - 1) + '-01-01',
  end : (end + 1) + '-12-31',
  groupOrder: 'content',
  zoomMin: 31540000000,
  stack: false,
  margin: {
    item: 20
  }
}

const months = ['01', '04', '07', '12']

let curYear = start
let id = 1
let defaultItems = []
let defaultItemsMap = {}
while (curYear <= end) {
  // {id: 1, content: '1992', start: '1992-01-01'}
  const item = {
    id : id,
    group : 1,
    content : curYear + '',
    start : curYear + '-01-01'
  };
  defaultItems.push(item);
  defaultItemsMap[item.id] = item;
  id += 1;
  curYear += 1;
}
let groups = [{
    id: 1,
    content: 'Years'
  },
  {
    id: 2,
    content: 'Major Events'
  }
]
const maxId = 26

class Timeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups : groups,
      items : defaultItems,
      selectedIds : [],
      playing : false,
      speed : 4000,
      selectedDrug : {},
      eventData : []
    };

    this.onClick = this.onClick.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.getDrugEvents = this.getDrugEvents.bind(this);
  }

  onClickReset() {
    this.setState({
      selectedIds : [],
      playing : false
    }, () => {this.props.selectYear(0)});
  }

  onClick(props) {
    //console.log(props);
    const { group, item } = props;
    // should just be one
    const selectedIds = this.state.items
      .filter(i => (+i.id <= 26  && i.group === group && i.id === item))
      .map(i => i.id);
    this.setState({
      selectedIds : selectedIds
    });
    if (selectedIds.length > 0) {
      this.props.selectYear(defaultItemsMap[selectedIds[0]].content);
    } else {
      this.props.selectYear(0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.resetYear) {
      this.setState({
        selectedIds : []
      });
    }

    if (nextProps.eventData) {
      this.getDrugEvents(nextProps.eventData);
    }
  }

  getDrugEvents(eventData) {
    if (eventData) {
        let newItems = defaultItems.slice(0, 25);

        eventData.forEach(e => {
          const date = e.date.substring(0, 10)
          if (e.event_type === "FDA_APPROVAL") {
            const item = {
              id : id,
              group : 2,
              content : "FDA Approval",
              start : date
            }
            newItems.push(item);
            id += 1;
          }

        });
        this.setState({ items : newItems, selectedIds : this.state.selectedIds });
    }

  }

  playTimeline() {
    if (this.state.playing) {
      const sel = !_.isEmpty(this.state.selectedIds) ? this.state.selectedIds[0] : 0;
      let id = sel + 1;
      if (id > maxId) {
        id = 1
      }
      this.setState({
        selectedIds : [id]
      }, () => {
        this.props.selectYear(defaultItemsMap[id].content);
      });
    }
  }

  componentDidMount() {
    setInterval(this.playTimeline.bind(this), 1000);
  }

  play() {
    this.setState({playing: true});
  }

  pause() {
    this.setState({playing: false});
  }

  render() {
    return (
      <div className="col-xs-12" style={{ height: "110px", width: "99%", padding: "3px"}}>
        <div style={{marginBottom:"5px"}}>
          <button onClick={this.play} type="button" className="btn btn-success btn-sm"><i className="fa fa-play"></i></button>
          <button onClick={this.pause} type="button" className="btn btn-danger btn-sm"><i className="fa fa-pause"></i></button>
          <button onClick={this.onClickReset} type="button" className="btn btn-primary btn-sm"><i className="fa fa-refresh"></i></button>
        </div>
        <div>
          <div style={{float: "right", minWidth: "200px", zIndex: "-100"}}>&nbsp;</div>
          <VisTimeline
            options={options}
            items={this.state.items}
            groups={this.state.groups}
            selection={this.state.selectedIds}
            clickHandler={this.onClick}
            />
          </div>
        </div>
    );
  };
}

export default Timeline;
