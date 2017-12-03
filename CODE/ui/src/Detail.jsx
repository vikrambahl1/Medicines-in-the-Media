import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import Slider from 'react-slick';
import Interweave from 'interweave';
import moment from 'moment';
import { UrlMatcher, HashtagMatcher, EmailMatcher } from 'interweave-autolink';
import { Treemap } from 'recharts';

const YOUR_NY_TIMES_API_KEY = ""
const YOUR_GUARDIAN_API_KEY = ""

const maxArticleSize = 6;
const settings = {
  dots: true,
  infinite: true,
  speed: 5000,
  autoplay : true,
  slidesToShow: 1,
  slidesToScroll: 1
};

const STOPWORDS =
['own', 'lll', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'an', 'and', 'another', 'any', 'anybody', 'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'as', 'ask', 'asked', 'asking', 'asks', 'at', 'away', 'b', 'back', 'backed', 'backing', 'backs', 'be', 'became', 'because', 'become', 'becomes', 'been', 'before', 'began', 'behind', 'being', 'beings', 'best', 'better', 'between', 'big', 'both', 'but', 'by', 'c', 'came', 'can', 'cannot', 'case', 'cases', 'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'd', 'did', 'differ', 'different', 'differently', 'do', 'does', 'done', 'down', 'down', 'downed', 'downing', 'downs', 'during', 'e', 'each', 'early', 'either', 'end', 'ended', 'ending', 'ends', 'enough', 'even', 'evenly', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'f', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few', 'find', 'finds', 'first', 'for', 'four', 'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'g', 'gave', 'general', 'generally', 'get', 'gets', 'give', 'given', 'gives', 'go', 'going', 'good', 'goods', 'got', 'great', 'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'h', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'herself', 'high', 'high', 'high', 'higher', 'highest', 'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'important', 'in', 'interest', 'interested', 'interesting', 'interests', 'into', 'is', 'it', 'its', 'itself', 'j', 'just', 'k', 'keep', 'keeps', 'kind', 'knew', 'know', 'known', 'knows', 'l', 'large', 'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely', 'long', 'longer', 'longest', 'm', 'made', 'make', 'making', 'man', 'many', 'may', 'me', 'member', 'members', 'men', 'might', 'more', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'my', 'myself', 'n', 'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'new', 'newer', 'newest', 'next', 'no', 'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'o', 'of', 'off', 'often', 'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'open', 'opened', 'opening', 'opens', 'or', 'order', 'ordered', 'ordering', 'orders', 'other', 'others', 'our', 'out', 'over', 'p', 'part', 'parted', 'parting', 'parts', 'per', 'perhaps', 'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting', 'presents', 'problem', 'problems', 'put', 'puts', 'q', 'quite', 'r', 'rather', 'really', 'right', 'right', 'room', 'rooms', 's', 'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems', 'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since', 'small', 'smaller', 'smallest', 'so', 'some', 'somebody', 'someone', 'something', 'somewhere', 'state', 'states', 'still', 'still', 'such', 'sure', 't', 'take', 'taken', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those', 'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'to', 'today', 'together', 'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'u', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'v', 'very', 'w', 'want', 'wanted', 'wanting', 'wants', 'was', 'way', 'ways', 'we', 'well', 'wells', 'went', 'were', 'what', 'when', 'where', 'whether', 'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without', 'work', 'worked', 'working', 'works', 'would', 'x', 'y', 'year', 'years', 'yet', 'you', 'young', 'younger', 'youngest', 'your', 'yours', 'z']


const COLORS = ['#1F9BCF'];

const CustomizedContent = React.createClass({
  render() {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor(index / root.children.length * 6)] : 'none',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {
          depth === 2 ?
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
          >
            {name}
          </text>
          : null
        }
      </g>
    );
  }
});

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDrug : {},
      fdaInfo : {},
      drugInfo : {},
      rxcui : '',
      imageUrl : '',
      info : '',
      articles : [],
      tweets : [],
      twitterIntervalTime : 120000,
      fdaApproval : '',
      adrData : []

    };

    this.lookupDetailInfo = this.lookupDetailInfo.bind(this);
    this.lookupFdaInfo = this.lookupFdaInfo.bind(this);
    this.lookupGuardianArticles = this.lookupGuardianArticles.bind(this);
    this.lookupNyTimesArticles = this.lookupNyTimesArticles.bind(this);
    this.lookupImageInfo = this.lookupImageInfo.bind(this);
    this.lookupTwitter = this.lookupTwitter.bind(this);
    this.lookupFdaApproval = this.lookupFdaApproval.bind(this);
    this.mapAdrData = this.mapAdrData.bind(this);
  }

  lookupFdaApproval(eventData) {
    if (eventData) {
        let fdaApproval = '';

        eventData.forEach(e => {
          if (e.event_type === "FDA_APPROVAL") {
            const date = e.date.substring(0, 10)
            if (date === '1982-01-01') {
              fdaApproval = 'Approved before Jan 1, 1982'
            } else {
              fdaApproval = 'Approved on ' + moment(date, 'YYYY-MM-DD').format('MMM D, YYYY');
            }
          }

        });
        this.setState({ fdaApproval : fdaApproval });
    }
  }

  lookupImageInfo(rxcui) {
    axios.get("https://rximage.nlm.nih.gov/api/rximage/1/rxnav?rxcui=" + rxcui)
      .then((response) => {
        if (response.data && !_.isEmpty(response.data.nlmRxImages)) {

          this.setState({
            imageUrl : response.data.nlmRxImages[0].imageUrl
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  lookupDetailInfo(selectedDrug) {
    if (selectedDrug && !_.isEmpty(selectedDrug.concept_name)) {
      this.lookupFdaInfo(selectedDrug, false);
      this.lookupNyTimesArticles(selectedDrug);
      this.lookupTwitter(selectedDrug)
    }
  }

  lookupTwitter(selectedDrug) {

    axios.get("http://tjg.pub/api/tweets/" + selectedDrug.concept_name + "/")
    //axios.get("./data/sample_tweets.json")
      .then((response) => {
        if (response.data && !_.isEmpty(response.data.tweets)) {
          this.setState({
            tweets : response.data.tweets
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  lookupFdaInfo(selectedDrug, brand) {
    const lookupKey = brand ? 'brand_name:' : 'generic_name:';
    axios.get("https://api.fda.gov/drug/label.json?&search=" + lookupKey + selectedDrug.concept_name)
      .then((response) => {
        if (response.data && response.data.results && response.data.results.length > 0) {
          const fdaObj = response.data.results[0];
          let drugInfo = fdaObj.openfda;
          let rxcui = '';
          let info = '';
          if (drugInfo && drugInfo.rxcui && drugInfo.rxcui.length > 0) {
            rxcui = drugInfo.rxcui[0];
            this.lookupImageInfo(rxcui);
          }
          if (!_.isEmpty(fdaObj.indications_and_usage)) {
            info = _.upperFirst(fdaObj.indications_and_usage[0]
              .replace("INDICATIONS AND USAGE: ", "")
              .replace("1. INDICATIONS AND USAGE ", "")
              .replace("1 INDICATIONS AND USAGE ", "")
              .replace("INDICATIONS AND USAGE ", "")
              .replace("INDICATIONS & USAGE ", "")
              .replace("INGREDIENTS: ", "")
              .replace("1 INDICATIONS & USAGE ", "")
              .replace("INDICATIONS & USAGE SECTION ", "")
              .replace("INDICATIONS: ", "")
              .replace("INDICATIONS ", "")
              .replace("(See DOSAGE AND ADMINISTRATION.)", "")
              .replace("HIGHLIGHTS OF PRESCRIBING INFORMATION ", ""))
          }

          if (_.isEmpty(info) && !_.isEmpty(fdaObj.description)) {
            info = _.upperFirst(fdaObj.description[0])
          }
          info = info.replace("[see Warnings and Precautions ")
            .replace("DESCRIPTION ", "")
            .replace("• ", " ")
            .replace("(1)", "")
            .replace("1)", "")
            .replace("(1", "")
            .replace("(5", "")
          if (info.length > 150) {
            info = info.split('.')[0].trim() + '.';
          }
          this.setState({
            fdaInfo : response.data.results[0],
            drugInfo : drugInfo,
            rxcui : rxcui,
            info : info
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (!brand) {
          this.lookupFdaInfo(selectedDrug, true);
        }
      });
  }

  lookupNyTimesArticles(selectedDrug) {
    //guardian articles
    axios.get("https://api.nytimes.com/svc/search/v2/articlesearch.json?q="
        + (selectedDrug.concept_name).split(' ').join('+')
        + "&api-key=" + YOUR_NY_TIMES_API_KEY + "&fq=document_type:article")
      .then((response) => {
        const size = Math.min(maxArticleSize/2, response.data.response.docs.length);
        if (size > 0) {
          let i = 0;
          const articles = response.data.response.docs
          .map((a) => {
            return {
              id : i++,
              url: a.web_url,
              date : a.pub_date,
              title : a.headline.main
            };
          });
          this.setState({
              articles : articles.slice(0, size)
          });
        }
        if (size <= maxArticleSize) {
          this.lookupGuardianArticles(selectedDrug);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  lookupGuardianArticles(selectedDrug) {
      //guardian articles
      axios.get("https://content.guardianapis.com/search?q="
          + (selectedDrug.concept_name).split(' ').join('+')
          + "&api-key=" + YOUR_GUARDIAN_API_KEY)
        .then((response) => {
          let guardianArticles = [];
          if (!_.isEmpty(response.data.response.results)) {
            guardianArticles = response.data.response.results.map((a) => {
              return {
                id : a.id,
                url: a.webUrl,
                date : a.webPublicationDate,
                title : a.webTitle
              };
            });

          }

          const articles = _.union(this.state.articles, guardianArticles);
          const size = Math.min(maxArticleSize, articles.length);
          this.setState({
              articles : _.slice(articles, 0, size)
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

  twitterInterval() {
    if (!_.isEmpty(this.state.selectedDrug.concept_name)) {
      console.log("lookup new twitter");
      this.lookupTwitter(this.state.selectedDrug);
    }
  }

  componentDidMount() {
    setInterval(this.twitterInterval.bind(this), this.state.twitterIntervalTime);
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDrug && nextProps.selectedDrug.concept_name !== this.state.selectedDrug.concept_name) {
      this.setState({
        selectedDrug : nextProps.selectedDrug,
        articles : [],
        tweets : [],
        fdaInfo : {},
        drugInfo : {},
        rxcui : '',
        imageUrl : '',
        info : '',
        twitterIntervalTime : 120000,
        adrData : []
      }, () => {
        this.lookupDetailInfo(nextProps.selectedDrug);
      });
    }

    if (!_.isEmpty(nextProps.eventData)) {
      this.lookupFdaApproval(nextProps.eventData);
    }

    if (!_.isEmpty(nextProps.adrData)) {
      this.mapAdrData(nextProps.adrData)
    }
  }

  mapAdrData(adrData) {
    let count = 0;
    let data = [];
    let children = [];
    let adrMap = {};
    adrData.forEach(a => {
      if (a.source) {
        a.source.split(",").forEach(a => {
          let adr = a.trim().toLowerCase();
            if (adr.length > 2 && STOPWORDS.indexOf(adr) < 0 && !_.isNumber(adr)) {
              if (!adrMap[adr]) {
                adrMap[adr] = 0;
              }
              count += 1;
              adrMap[adr] += 1;
          }
        });
      }
    });

    console.log(adrMap)
    Object.keys(adrMap).forEach(m => {
      const value = adrMap[m];
      children.push({
        name : m,
        size : value
      });
    });
    if (count >= 15) {
      children = children.slice(0, 15);
    }
    data.push({
      name : 'reactions',
      children : children
    })
    if (children.length === 0) {
      this.setState({adrData : []});
    } else {
      this.setState({adrData : data});
    }

  }


  render() {
    return (
      <div className="detail-pane">
        {_.isEmpty(this.props.selectedDrug.concept_name) ? <div style={{
              height: "100%",
              width: "100%",
              textAlign: "right",
              paddingTop: "8px",
              paddingRight: "10px"
          }}>
          <h3 className="text-success pull-right"><b>Type a medication name to view detail</b></h3>
        </div> : <span />}
        <h3>{this.props.selectedDrug && !_.isEmpty(this.props.selectedDrug.concept_name) ?
          this.props.selectedDrug.concept_name : ""}</h3>
        <h6 className="text-success">{this.state.fdaApproval}</h6>
        <div className="image-div">
        {this.state.info !== '' ?
          <div>
          {this.state.imageUrl !== '' ?
              <img className="image-div-img" src={this.state.imageUrl}/> : <span />}
            <label>{this.state.info}</label><br/>
          </div> : <span />}

        </div>
        {!_.isEmpty(this.state.adrData) ?
        <div style={{paddingTop: "3px"}}>
          <h5 className="text-success"><i className="fa fa-twitter"></i> Twitter Reactions</h5>
          <Treemap
            width={290}
            height={290}
            data={this.state.adrData}
            dataKey="size"
            ratio={1.25}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent colors={COLORS}/>}
          />
          <br/>
        </div>
        : <span />}

        {this.props.selectedDrug && !_.isEmpty(this.props.selectedDrug.concept_name) ?
          <h5 className="text-success" style={{paddingTop:"5px"}}><i className="fa fa-newspaper-o"></i> Media Coverage</h5> : <div /> }
        {
          this.state.articles.map((a) => {
            return (<div key={a.id}>
              <div>
                <label><a href={a.url} target="_blank" className="news-link">{a.title}</a></label>
              </div>
              <hr />
            </div>)
          })
        }

        <br/>
        {this.props.selectedDrug && !_.isEmpty(this.props.selectedDrug.concept_name) ?
          <h5 className="text-success"><i className="fa fa-twitter"></i> Tweets</h5> : <div /> }
        <Slider {...settings}>
        {
            this.state.tweets.map((t) => {
              return (<div className="tweet-row" key={t.timestamp_ms}>
                <section className="tweet-section">
                  <div className="tweet-left">
                    <img className="tweet-profile" src={t.user.profile_image_url}></img>
                  </div>
                  <div className="tweet-right">
                    <div className="tweet-name"><label style={{marginBottom:"0px"}}>{t.user.name}</label></div>
                    <div><a className="tweet-account"
                      href={"https://twitter.com/" + t.user.screen_name}>{"@" + t.user.screen_name}</a></div>
                  </div>
                </section>
                <br />
                <div>
                  <Interweave
                    hashtagUrl="https://twitter.com/hashtag/{{hashtag}}"
                    matchers={[new UrlMatcher('url'),
                          new EmailMatcher('email'),
                          new HashtagMatcher('hashtag')]}
                    content={t.text} />
                </div>
              </div>)
            })
        }
        </Slider>
      </div>

    )
  };
}

export default Detail;
