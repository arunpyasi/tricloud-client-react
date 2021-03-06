import React, { Component } from "react";
import { Card, CardBody, CardHeader, CardTitle, Table, Row, Col, CardFooter } from "reactstrap";
import { Link, Route } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import Websocket from "react-websocket";
import { number } from "prop-types";
import Stats from "components/Stats/Stats.jsx";
import withAuth from "components/Login/withAuth";
import { thead } from "variables/agents";
import Api from "service/Api";
import Moment from "react-moment";
import "moment-timezone";
import { Line } from "react-chartjs-2";
import { dashboardNASDAQChart } from "variables/charts.jsx";
import { formatBytes } from "../../service/utility";
const api = new Api();

class AgentStats extends Component {
  constructor(props) {
    super(props);
    this.agentid = this.props.match.params.agentId;
    this.state = {
      all_stats: {},
      mem_data: {},
      net_data: {},
      disk_data: {}
    };
  }

  componentDidMount() {
    this.getStats();
  }

  getStats() {
    var url = "/api/agents/" + this.agentid + "/status";
    console.log(url);
    var data = {
      noofentries: 10000,
      offset: 0
    };
    api.postData(url, data).then(result => {
      var mem_stats = [];
      var time_stamp = [];
      var net_downs = [];
      var net_ups = [];
      var disk_used = [];

      Object.entries(result.data).map(([key, value]) => {
        console.log(value);
        mem_stats.push(formatBytes(value.TotalMem - value.AvailableMem));
        time_stamp.push(new Date(value.TimeStamp / 1000000));
        net_ups.push(formatBytes(value.NetSentbytes));
        net_downs.push(formatBytes(value.NetRecvbytes));
        disk_used.push(formatBytes(value.DiskTotal - value.DiskFree));
      });

      this.setState({
        all_stats: result.data,
        mem_data: {
          mem_stats: mem_stats,
          time_stamp: time_stamp
        },
        net_data: {
          net_ups: net_ups,
          net_downs: net_downs,
          time_stamp: time_stamp
        },
        disk_data: {
          disk_used: disk_used,
          time_stamp: time_stamp
        }
      });
    });
  }

  render() {
    var MemChart = {
      data: {
        labels: this.state.mem_data.time_stamp,
        datasets: [
          {
            label: "Memory Used",
            data: this.state.mem_data.mem_stats,
            fill: false,
            borderColor: "#fbc658",
            backgroundColor: "transparent",
            pointBorderColor: "#fbc658",
            pointRadius: 4,
            pointHoverRadius: 4,
            pointBorderWidth: 8
          }
        ]
      },
      options: {
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "series",
              ticks: {
                source: "data",
                autoSkip: true
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "GB"
              }
            }
          ]
        },
        legend: {
          display: true,
          position: "bottom"
        }
      }
    };

    var NetChart = {
      data: {
        labels: this.state.net_data.time_stamp,
        datasets: [
          {
            label: "Upload",
            data: this.state.net_data.net_ups,
            fill: false,
            borderColor: "#fbc658",
            backgroundColor: "transparent",
            pointBorderColor: "#fbc658",
            pointRadius: 4,
            pointHoverRadius: 4,
            pointBorderWidth: 8
          },
          {
            label: "Download",
            data: this.state.net_data.net_downs,
            fill: false,
            borderColor: "#abe658",
            backgroundColor: "transparent",
            pointBorderColor: "#abe658",
            pointRadius: 4,
            pointHoverRadius: 4,
            pointBorderWidth: 8
          }
        ]
      },
      options: {
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "series",
              ticks: {
                source: "data",
                autoSkip: true
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Data Transfer"
              }
            }
          ]
        },
        legend: {
          display: true,
          position: "bottom"
        }
      }
    };

    var DiskChart = {
      data: {
        labels: this.state.disk_data.time_stamp,
        datasets: [
          {
            label: "Disk Used",
            data: this.state.disk_data.disk_used,
            fill: false,
            borderColor: "#fbc658",
            backgroundColor: "transparent",
            pointBorderColor: "#fbc658",
            pointRadius: 4,
            pointHoverRadius: 4,
            pointBorderWidth: 8
          }
        ]
      },
      options: {
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "series",
              ticks: {
                source: "data",
                autoSkip: true
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "GB"
              }
            }
          ]
        },
        legend: {
          display: true,
          position: "bottom"
        }
      }
    };
    return (
      <div className="content">
        <Row>
          <Col xs={12} sm={6} md={6} lg={9}>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <h3 className={"card-title text-center"}>Memory Graph</h3>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <Line data={MemChart.data} options={MemChart.options} />
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={9}>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <h3 className={"card-title text-center"}>Network Graph</h3>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <Line data={NetChart.data} options={NetChart.options} />
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={9}>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <h3 className={"card-title text-center"}>Disk Graph</h3>
                  </Col>
                </Row>
              </CardBody> 
              <CardFooter>
                <Line data={DiskChart.data} options={DiskChart.options} />
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withAuth(AgentStats);
