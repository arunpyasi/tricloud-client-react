import React, { Component } from "react";
import { Card, CardBody, CardHeader, CardTitle, Table, Row, Col } from "reactstrap";
import withAuth from "components/Login/withAuth";
import { thead } from "variables/agents";
import Api from "service/Api";
import "./Agents.css";
import { Link } from "react-router-dom";

const api = new Api();
class Agents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      agents: null,
      agentsinfo: [],
      agentsempty: true
    };
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this.getAgents();
  }
  componentDidUpdate() {
    // this.getAgents();
  }

  getAgents() {
    const agentuser = this.props.agentuser;

    console.log("agentuser", agentuser);

    api.getData("/api/agents").then(result => {
      let agentsinfos = [];
      if (result.data.length > 0) {
        result.data.map(function(key) {
          const info = {
            data: [key.id, key.systeminfo.os, key.systeminfo.hostname, key.owner, key.systeminfo.platform + " " + key.systeminfo.platformVersion, key.active ? "Active" : "Inactive"]
          };
          agentsinfos.push(info);
        });
        this.setState({
          agentsinfo: agentsinfos,
          agentsempty: false
        });
      } else {
        this.setState({
          agentsinfo: [],
          agentsempty: true
        });
      }
    });
  }

  componentWillUnmount() {
    this.setState({
      agentsinfo: [],
      agentsempty: true
    });
  }

  handleDelete(prop, key) {
    var agentID = prop.data[0];
    api.deleteData("/api/agents/" + agentID).then(result => {
      if (result.status === "ok") {
        console.log(result.status);
        this.props.notify("Successfully delete agent " + agentID);
      }
      var agentsinfo = this.state.agentsinfo;
      delete agentsinfo[key];
      this.setState({
        agentsinfo: agentsinfo
      });
    });
  }
  render() {
    let emptyinfo;
    if (this.state.agentsempty) {
      emptyinfo = (
        <div>
          <center>Agent not found</center>
        </div>
      );
    }
    return (
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">List of Agents</CardTitle>
              </CardHeader>
              <CardBody>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      {thead.map((prop, key) => {
                        if (key === thead.length - 1)
                          return (
                            <th key={key} className="text-right">
                              {prop}
                            </th>
                          );
                        return <th key={key}>{prop}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.agentsinfo.map((prop, key) => {
                      return (
                        <tr key={key}>
                          {prop.data.map((prop, key) => {
                            return <td key={key}>{prop}</td>;
                          })}
                          <td>
                            <div className="row">
                              <div className="col action">
                                <Link to={`/agents/` + prop.data[0]}>
                                  <i className="nc-icon nc-button-play text-success" />
                                </Link>
                              </div>
                              <div className="col action">
                                <Link to={`/agents/` + prop.data[0] + `/stats/`}>
                                  <i className="nc-icon nc-sound-wave text-warning" />
                                </Link>
                              </div>
                              <div className="col action">
                                <Link to="#">
                                  <i className="nc-icon nc-simple-remove text-danger deletelist" onClick={() => this.handleDelete(prop, key)} />
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {emptyinfo}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withAuth(Agents);
