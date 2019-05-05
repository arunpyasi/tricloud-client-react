import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Row,
  Col,
  CardFooter
} from "reactstrap";
import { Link, Route } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import Websocket from "react-websocket";
import { number } from "prop-types";

import UsageBar from "components/UsageBar/UsageBar";
import Terminal from "components/Terminal/Terminal";
import Stats from "components/Stats/Stats.jsx";
import withAuth from "components/Login/withAuth";
import { thead } from "variables/agents";
import Api from "service/Api";
import './AgentDetail.css';
import {
  parsePacket,
  encodeMsg,
  CMD_SYSTEM_STAT,
  CMD_TERMINAL
} from "../../service/utility";

const api = new Api();

class AgentDetail extends Component {
  constructor(props) {
    super(props);
    this.agentid = this.props.match.params.agentId;
    this.state = {
      agentinfo: {},
      systeminfo: {},
      realcpumem_usage: {},
      avgcpu_usage: 0,
      allcpu_usage: []
    };
    this.getAgentData = this.getAgentData.bind(this);
    this.webSocketResponse = this.webSocketResponse.bind(this);
    this.terminalToWs = this.terminalToWs.bind(this);
    this.ProcessTerminal = this.ProcessTerminal.bind(this);
    this.ProcessSystemStat = this.ProcessSystemStat.bind(this);
    this.startTerminal = this.startTerminal.bind(this);
    this.terminalRef = React.createRef();
    this.websocketRef = React.createRef();
    this.cpumem_usage = {};
    this.head = {};
  }

  componentDidMount() {
    this.getAgentData();
  }

  getAgentData() {
    api.getData("/api/agents/" + this.agentid).then(result => {
      const systeminfo = result.data["systeminfo"];
      delete result.data["systeminfo"];
      this.setState({
        agentinfo: result.data,
        systeminfo: systeminfo
      });
    });
  }

  webSocketResponse(event) {
    console.log(event);
    let myReader = new FileReader();
    myReader.readAsArrayBuffer(event);
    myReader.addEventListener("loadend", e => {
      let [head, body] = parsePacket(e.srcElement.result);
      this.head = head;
      console.log(head, body);
      switch (head.cmdtype) {
        case CMD_SYSTEM_STAT:
          this.ProcessSystemStat(head, body);
          break;
        case CMD_TERMINAL:
          this.ProcessTerminal(head, body);
          break;
        default:
          console.log("Not implemented");
          break;
      }
    });
  }

  ProcessTerminal(header, body) {
    console.log("VERY NEAR", body);
    this.terminalRef.current.outputFromAgent(body.Data);
  }

  ProcessSystemStat(respHead, respBody) {
    this.cpumem_usage = respBody;
    let cpu_cores = this.cpumem_usage["CPUPercent"];
    let totalcpu_usage = cpu_cores.reduce(
      (previous, current) => (current += previous)
    );
    let avgcpu_usage = Math.round(totalcpu_usage / cpu_cores.length);
    let allcpu_usage = cpu_cores;
    
    this.setState({
      avgcpu_usage: avgcpu_usage,
      allcpu_usage : allcpu_usage,
    });
  }

  startTerminal() {
    let out = encodeMsg({ Data: "" }, this.head.connid, CMD_TERMINAL, 1);
    this.websocketRef.current.sendMessage(out);
  }

  terminalToWs(data) {
    let out = encodeMsg({ Data: data }, this.head.connid, CMD_TERMINAL, 1);
    this.websocketRef.current.sendMessage(out);
  }

  render() {
    var agentinfo = Object.entries(this.state.agentinfo).map(([key, value]) => {
      return (
        <div>
          {key} : {value}
        </div>
      );
    });
    var systeminfo = Object.entries(this.state.systeminfo).map(
      ([key, value]) => {
        return (
          <div>
            {key} : {value}
          </div>
        );
      }
    );

    var realmem_usage = Object.entries(this.state.realcpumem_usage).map(
      ([key, value]) => {
        if (key !== "CPUPercent") {
          return (
            <div>
              {key} : {value}
            </div>
          );
        }
      }
    );

    //console.log(api.getToken());
    //dashboard-level
    return (
      <div className="content">
        <Row>
          <Col xs={12} sm={6} md={6} lg={5}>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <h3 className={"card-title cpu_usage_title"}>CPU USAGE</h3>
                  </Col>
                </Row>
                <Row>
                  <Col id="realcpu_usage">
                    <UsageBar data={this.state.avgcpu_usage} />
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                  <h3>{this.state.avgcpu_usage}%</h3>
                <hr />
                <span>Total CPU Cores :{this.state.allcpu_usage.length}</span>
                <ul id="allcpu_usage" className={"allcpu_usage"}>

                  {
                    Object.keys(this.state.allcpu_usage).map(key => {
                      return <li>{Math.round(this.state.allcpu_usage[key])}% </li>
                    })
                  }
                </ul>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card>
              <CardBody>
                <Row>
                  <Col>{agentinfo}</Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
              </CardFooter>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card>
              <CardBody>
                <Row>
                  <Col>{systeminfo}</Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <input
          type="button"
          onClick={this.startTerminal}
          name="Terminal start"
        />
        <Row>
          <Col xs={12} sm={12} md={12} lg={12}>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <Terminal
                      ref={this.terminalRef}
                      sendtows={this.terminalToWs}
                    />
                  </Col>
                </Row>
              </CardBody>
              <CardFooter />
            </Card>
          </Col>
        </Row>

        <Websocket
          url={"ws://localhost:8080/websocket/" + api.getToken()}
          ref={this.websocketRef}
          onMessage={this.webSocketResponse.bind(this)}
        />
      </div>
    );
  }
}

export default AgentDetail;
