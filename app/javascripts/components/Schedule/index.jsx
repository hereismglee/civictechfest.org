import React, { Component } from 'react';
import schedules from './schedules_by_track.json';
import { getLocale } from "javascripts/locale";
import Filter from "./filter";
import Session from './session';
import styles from "./styles.css";
import classnames from "classnames/bind";
import { StickyContainer, Sticky } from 'react-sticky';
const cx = classnames.bind(styles);

const venues = [
  /* old room */
  {
    "id": "r1",
    "title": "R1",
    "color": "#8B4AA8"
  },
  {
    "id": "r0",
    "title": "R0",
    "color": "#36AAA8"
  },
  {
    "id": "r2",
    "title": "R2",
    "color": "#4EA23B"
  },

  /* new room */
  {
    "id": "r0",
    "title": "201 B",
    "color": "#8CC63F"
  },
  {
    "id": "r1",
    "title": "201 C",
    "color": "#00A99D"
  },
  {
    "id": "r2",
    "title": "4F Joy",
    "color": "#F7931E"
  },
  {
    "id": "r3",
    "title": "4F Elegance",
    "color": "#ED1C24"
  },
  {
    "id": "r4",
    "title": "201 A",
    "color": "#29ABE2"
  },
  {
    "id": "r5",
    "title": "201 F",
    "color": "#0071BC"
  }

];

const venueObj = venues.reduce((aggObj, venue, idx) => {
  aggObj[venue.title] = venue
  aggObj.index = idx
  return aggObj
}, {})

const DAY_2 = "Tue Sep 12 2017";
const DAY_3 = "Wed Sep 13 2017";

function mapTimeSlotToItems(day, value, i) {
  let id = `day${day}-all-${i}`;
  let venue = value.venue || (value.event && value.event.venue);
  let { hash } = this.props.location;
  let selected = hash ? (hash === '#' + id) : false;
  let event = () => schedules[getLocale()][`day${day}`][i].event;
  if(venue && this.state.venueOn) {
    let venueState = this.state.venues.filter(cat => cat.title === venue)[0]
    if(!venueState.active) return false;
  }

  let content;
  if (!value.time) {
    return (
      <div
        className={cx({ "Schedule-item" : true, })}
        key={i}
        style={{ color: '#FFF', backgroundColor: venueObj[value.venue].color}}
      >
        <div className="Schedule-time">
          <span className={value.icomoon}></span>
          {value.title}／{venue}
        </div>

        <a id={`slot-${id}`} href={`#${id}`}
          className={cx({
            "Schedule-tagline" : true
          })}
          onClick={this.setSession.bind(this, event, value.time)}>

          <div className="Schedule-main">
            <div>{value.tagline}</div>
            { value.anchor && <div className="Schedule-anchor">{schedules[getLocale()].moderator}: {value.anchor}</div> }
          </div>
        </a>
      </div>
    );
  } else {
    let [timeStart, timeEnd] = value.time.split('-');
    return (
      <div className={cx({
            "Schedule-item" : true,
            "Schedule-keynote" : !venue,
            })}
           key={i}>
        <div className="Schedule-time">
          {timeStart}<span className="Schedule-timeEnd"> - {timeEnd}</span>
        </div>
        {
          do {
            if (typeof value.event === 'string') {
              <div className="Schedule-event">{value.event}</div>
            } else {
              <a id={`slot-${id}`} href={`#${id}`}
                className={cx({
                  "Schedule-event" : true,
                })}
                style={selected ? {backgroundColor: '#FFF7CB'} : {}}
                onClick={this.setSession.bind(this, event, value.time)}>
                <div className="Schedule-main">
                  {value.event.title}
                  <div className="Schedule-presenter">{value.event.speaker}</div>
                  {
                    venue ? (
                      <div className="Schedule-categoryIcon" style={{
                             "background" : venueObj[venue].color
                           }}
                           title={`Toggle venue "${venue}"`}
                           onClick={this.toggleVenue.bind(this, venueObj[venue].index)}
                           ></div>

                    ) : null
                  }
                </div>
              </a>
            }
          }
        }
      </div>
    );
  }
}

export default class Schedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
    showSession: false,
    venueOn: false,
    mobileFilterOn: false,
    venues: venues.map(venue => ({...venue, active: false})),
    currentSection: (new Date().toDateString() === DAY_2) ? "day2" : "",
    currentSection: (new Date().toDateString() === DAY_3) ? "day3" : "",
    currentSession: () => ({}),
    currentSessionTime: null,
    };
  }

  componentDidMount() {
    const { hash } = this.props.location;

    this.setState({currentSection: (new Date().toDateString() === DAY_2) ? "day2" : ""});
    this.setState({currentSection: (new Date().toDateString() === DAY_3) ? "day3" : ""});

    if (hash) {
      setTimeout(() => document.getElementById(hash.replace('#', 'slot-')).scrollIntoView(false), 300);
      const dataArray = hash.replace('#', '').split('-');
      const value = schedules[getLocale()][dataArray[0]][dataArray[2]];
      this.setState({
        showSession: true,
        currentSession: () => schedules[getLocale()][dataArray[0]][dataArray[2]].event,
        currentSessionTime: value.time
      });
    }
  }

  setSession(value, time) {
    this.setState({
      showSession: true,
      currentSession: value,
      currentSessionTime: time,
    })

    document.body.classList.add(styles.mobileScrollLock);
  }
  resetSession = () => {
    this.setState({
      showSession: false,
      currentSession: () => ({}),
      currentSessionTime: null,
    })
    document.body.classList.remove(styles.mobileScrollLock);
  };
  setSection(currentSection) {
    console.log(currentSection);
    window.scrollTo(this._root.offsetLeft, this._root.offsetTop);
    this.setState({ currentSection });
  }
  toggleVenue = id => {
    let venues = this.state.venues.slice(0);
    venues[id] = {...venues[id], active: !venues[id].active}
    this.setState({venues, venueOn: true})
    window.scrollTo(this._root.offsetLeft, this._root.offsetTop);
  }
  clearVenue = () => {
    this.setState({
      venues: venues.map(venue => ({...venue, active: false})),
      venueOn: false
    })
    window.scrollTo(this._root.offsetLeft, this._root.offsetTop);
  }
  toggleMobileFilter = () => {
    this.setState({mobileFilterOn: !this.state.mobileFilterOn})
  }
  render () {
    return (
      <div className={styles.root} ref={c => this._root = c}>
       <div className={styles.container}>
        <h2>Agenda</h2>
        <div className={styles.orange_dateline}>
          <span className={styles.grey}>9</span>
          <span className={styles.grey}>10</span>
          <span>11</span>
          <span>12</span>
          <span>13</span>
          <span className={styles.grey}>14</span>
          <span className={styles.grey}>15</span>
          <span className={styles.grey}>16</span>
        </div>
        <h1>TICTeC@Taipei</h1>
       </div>
        <StickyContainer>
          <div className={styles.container}>
            <div className={cx({
              "Home-filter": true,
            })}>
              <Sticky topOffset={-60} stickyStyle={{marginTop: 60}}>
                <Filter
                  title='venues'
                  data={this.state.venues}
                  filterOn={this.state.venueOn}
                  toggleCategoryHandler={this.toggleVenue}
                  clearCategoryHandler={this.clearVenue}
                />
              </Sticky>
            </div>
            <div className={cx({
              "Home-schedule": true,
              "with-session" : this.state.showSession,
            })}>
              <div className={`Schedule`}>
                <Sticky topOffset={-60} stickyStyle={{marginTop: 60}}>
                  <div className={cx({
                      "Schedule-title" : true,
                      "with-session" : this.state.showSession,
                      "without-session" : !this.state.showSession
                    })}>

                    <div className="Schedule-dayButtonLeftstop">
                      <div className={cx({
                             "Schedule-dayButton" : true,
                             "is-active" : this.state.currentSection === "day0"
                           })}
                           onClick={this.setSection.bind(this, 'day0')}>Day 0</div>
                    </div>
                    <div className={cx({
                           "Schedule-dayButton" : true,
                           "is-active" : this.state.currentSection === "day1"
                         })}
                         onClick={this.setSection.bind(this, 'day1')}>Day 1</div>
                    <div className={cx({
                           "Schedule-dayButton" : true,
                           "is-active" : this.state.currentSection === "day2"
                         })}
                         onClick={this.setSection.bind(this, 'day2')}>Day 2</div>
                    <div className={cx({
                           "Schedule-dayButton" : true,
                           "is-active" : this.state.currentSection === "day3"
                         })}
                         onClick={this.setSection.bind(this, 'day3')}>Day 3</div>

                    <div className="Schedule-switchBtn" onClick={this.props.onSwitch}>View Parallel</div>
                    <div className={cx({
                           'Schedule-filterBtn': true,
                           'is-show': this.state.mobileFilterOn,
                         })}
                         onClick={this.toggleMobileFilter}>Filter
                      <div className={cx({'Schedule-bar1': true, 'is-active': this.state.mobileFilterOn})}></div>
                      <div className={cx({'Schedule-bar2': true, 'is-active': this.state.mobileFilterOn})}></div>
                    </div>
                  </div>
                  <div className={cx({
                    'Schedule-filterPanel': true,
                    'is-show': this.state.mobileFilterOn,
                  })}>
                    <Filter ref="filter"
                            title='venues'
                            data={this.state.venues}
                            filterOn={this.state.venueOn}
                            toggleCategoryHandler={this.toggleVenue}
                            clearCategoryHandler={this.clearVenue}
                            togglePanelHandler={this.toggleMobileFilter}/>
                  </div>
                </Sticky>
                <div
                  className={cx({
                    "Home-section": true,
                    "is-hidden": this.state.currentSection !== ''&& this.state.currentSection !== 'day0'
                  })}
                  ref={(c) => this.day0 = c}
                  id="day0"
                >
                  <div className="Schedule-day">9/10 (Sun.)</div>
                  <section>
                    {schedules[getLocale()]["day0"].map(mapTimeSlotToItems.bind(this, 0))}
                  </section>
                </div>
                <div
                  className={cx({
                    "Home-section": true,
                    "is-hidden": this.state.currentSection !== ''&& this.state.currentSection !== 'day1'
                  })}
                  ref={(c) => this.day1 = c}
                  id="day1"
                >
                  <div className="Schedule-day">9/11 (Mon.)</div>
                  <section>
                    {schedules[getLocale()]["day1"].map(mapTimeSlotToItems.bind(this, 1))}
                  </section>
                </div>
                <div
                  className={cx({
                    "Home-section": true,
                    "is-hidden": this.state.currentSection !== '' && this.state.currentSection !== 'day2'
                  })}
                  ref={(c) => this.day2 = c}
                  id="day2"
                >
                  <div className="Schedule-day">9/12 (Tue.)</div>
                  <section>
                    {schedules[getLocale()]["day2"].map(mapTimeSlotToItems.bind(this, 2))}
                  </section>
                </div>
                <div
                  className={cx({
                    "Home-section": true,
                    "is-hidden": this.state.currentSection !== '' && this.state.currentSection !== 'day3'
                  })}
                  ref={(c) => this.day3 = c}
                  id="day3"
                >
                  <div className="Schedule-day">9/13 (Wed.)</div>
                  <section>
                    {schedules[getLocale()]["day3"].map(mapTimeSlotToItems.bind(this, 3))}
                  </section>
                </div>
                
              </div>
            </div>
            <div className={cx({
                "Home-session" : true,
                "is-show": this.state.showSession,
              })}>
              <Session
                sessionHandler={this.resetSession}
                data={this.state.currentSession()}
                time={this.state.currentSessionTime}
                categories={venues}
              />
            </div>
          </div>
        </StickyContainer>
        <div className={cx({
          backdrop: true,
          isShown: this.state.showSession,
        })} onClick={this.resetSession} />
      </div>
    );
  }
}

export {default as ScheduleParallel} from './parallel'
