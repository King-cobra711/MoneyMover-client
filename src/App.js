import React, { useState, useEffect } from "react";
import "./App.css";
import * as ReactStrap from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Collapse, CardBody, Card } from "reactstrap";
function App() {
  const [balanceA, setBalanceA] = useState(0);
  const [balanceB, setBalanceB] = useState(0);
  const [Asend, setASend] = useState(false);
  const [Bsend, setBsend] = useState(false);
  const [Ahistory, setAhistory] = useState([]);
  const [Bhistory, setBHistory] = useState([]);
  const [addTake, setAddTake] = useState(0);
  const [showAddTake, setShowAddTake] = useState(false);
  const [aSendValue, setASendValue] = useState(0);
  const [bSendValue, setBSendValue] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [Aerror, setAerror] = useState("");
  const [Berror, setBerror] = useState("");
  const [isOpenA, setIsOpenA] = useState(false);
  const [isOpenB, setIsOpenB] = useState(false);

  const toggleA = () => setIsOpenA(!isOpenA);
  const toggleB = () => setIsOpenB(!isOpenB);

  useEffect(() => {
    setAerror("");
    setBerror("");
    async function fetchBalances() {
      const request = await fetch("https://money-mover-server.herokuapp.com/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(),
      })
        .catch((error) => console.log(error))
        .then((res) => {
          if (res.status === 200) {
            res.json().then((data) => {
              setBalanceA(data.Abalance);
              setBalanceB(data.Bbalance);
            });
          }
        });
      return request;
    }
    fetchBalances();
  }, [refresh]);

  const submitA = () => {
    if (aSendValue === 0 || aSendValue === "0") {
      setAerror("Can't send $0");
    } else {
      if (aSendValue < 0) {
        setAerror("must be positive value");
      } else {
        if (balanceA - aSendValue < 0) {
          setAerror("Insufficent funds");
        } else {
          async function sendMoney() {
            const request = await fetch(
              "https://money-mover-server.herokuapp.com/moneyToB",
              {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  money: aSendValue,
                }),
              }
            ).then((res) => {
              if (res.status === 200) {
                setRefresh(!refresh);
                setAddTake(aSendValue);
                setASend(true);
                setBsend(false);
                setAhistory([...Ahistory, -aSendValue]);
                setBHistory([...Bhistory, +aSendValue]);
                setShowAddTake(true);
                setTimeout(() => {
                  setShowAddTake(false);
                }, 1000);
                setASendValue(0);
                setBSendValue(0);
                document.getElementById("AmountA").value = "";
                document.getElementById("AmountB").value = "";
              } else if (res.status === 406) {
                res.json().then((data) => {
                  setAerror(data.error[0].msg);
                });
              } else {
                console.log("ERROR");
              }
            });
            return request;
          }
          sendMoney();
        }
      }
    }
  };
  const submitB = () => {
    if (bSendValue === 0 || bSendValue === "0") {
      setBerror("Can't send $0");
    } else {
      if (bSendValue < 0) {
        setBerror("Must be positive value");
      } else {
        if (balanceB - bSendValue < 0) {
          setBerror("Insufficient funds");
        } else {
          async function sendMoney() {
            const request = await fetch(
              "https://money-mover-server.herokuapp.com/moneyToA",
              {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  money: bSendValue,
                }),
              }
            ).then((res) => {
              if (res.status === 200) {
                setRefresh(!refresh);
                setAddTake(bSendValue);
                setASend(false);
                setBsend(true);
                setBHistory([...Bhistory, -bSendValue]);
                setAhistory([...Ahistory, +bSendValue]);
                setShowAddTake(true);
                setTimeout(() => {
                  setShowAddTake(false);
                }, 1000);
                setASendValue(0);
                setBSendValue(0);
                document.getElementById("AmountA").value = "";
                document.getElementById("AmountB").value = "";
              } else if (res.status === 406) {
                res.json().then((data) => {
                  setBerror(data.error[0].msg);
                });
              } else {
                console.log("ERROR");
              }
            });
            return request;
          }
          sendMoney();
        }
      }
    }
  };
  return (
    <div className="App">
      <h1 id="title">Money Transfer</h1>
      <ReactStrap.Container>
        <ReactStrap.Row>
          <ReactStrap.Col id="borderR" className="accountName">
            <h3>Account A</h3>
          </ReactStrap.Col>
          <ReactStrap.Col id="borderL" className="accountName">
            <h3>Account B</h3>
          </ReactStrap.Col>
        </ReactStrap.Row>
        <ReactStrap.Row>
          <ReactStrap.Col id="balance" className="borderR">
            Balance: ${balanceA}
            {showAddTake ? (
              <p id="aside" className={Asend ? "neg" : "pos"}>
                {Asend ? "- $" + addTake : "+ $" + addTake}
              </p>
            ) : (
              <p className="noVis"></p>
            )}
          </ReactStrap.Col>
          <ReactStrap.Col
            style={{ position: "relative" }}
            id="balance"
            className="borderL"
          >
            Balance: ${balanceB}
            {showAddTake ? (
              <p id="bside" className={Bsend ? "neg" : "pos"}>
                {Bsend ? "- $" + addTake : "+ $" + addTake}
              </p>
            ) : (
              <p className="noVis"></p>
            )}
          </ReactStrap.Col>
        </ReactStrap.Row>
        <ReactStrap.Row>
          <ReactStrap.Col className="borderR">
            <ReactStrap.Form>
              <ReactStrap.Form.Group controlId="AmountA">
                <ReactStrap.Form.Control
                  onBlur={() => setBSendValue(0)}
                  onChange={(event) => setASendValue(event.target.value)}
                  type="number"
                  placeholder="Enter amount..."
                ></ReactStrap.Form.Control>
                <p className="error">{Aerror}</p>
                <ReactStrap.Button
                  className="mt-10"
                  onClick={() => submitA()}
                  variant="outline-primary"
                >
                  Send to B
                </ReactStrap.Button>
              </ReactStrap.Form.Group>
            </ReactStrap.Form>
          </ReactStrap.Col>
          <ReactStrap.Col className="borderL">
            <ReactStrap.Form>
              <ReactStrap.Form.Group controlId="AmountB">
                <ReactStrap.Form.Control
                  onBlur={() => setASendValue(0)}
                  onChange={(event) => setBSendValue(event.target.value)}
                  type="number"
                  placeholder="Enter amount..."
                ></ReactStrap.Form.Control>
                <p className="error">{Berror}</p>
              </ReactStrap.Form.Group>
              <ReactStrap.Button
                className="mt-10"
                onClick={() => submitB()}
                variant="outline-primary"
              >
                Send to A
              </ReactStrap.Button>
            </ReactStrap.Form>
          </ReactStrap.Col>
        </ReactStrap.Row>
        <ReactStrap.Row>
          <ReactStrap.Col style={{ paddingTop: "1.6em" }} className="borderR">
            <ReactStrap.Button onClick={() => toggleA()} variant="light">
              Transaction History
            </ReactStrap.Button>
            <Collapse isOpen={isOpenA}>
              <Card>
                <CardBody>
                  {Ahistory.length > 0 ? (
                    Ahistory.map((val, key) => {
                      return (
                        <div>
                          {val >= 0 ? (
                            <p className="historyPos">+ ${val}</p>
                          ) : (
                            <p className="historyNeg">- ${val * -1}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p>N/A</p>
                  )}
                </CardBody>
              </Card>
            </Collapse>
          </ReactStrap.Col>
          <ReactStrap.Col style={{ paddingTop: "1.6em" }}>
            <ReactStrap.Button
              onClick={() => {
                toggleB();
              }}
              variant="light"
            >
              Transaction History
            </ReactStrap.Button>
            <Collapse isOpen={isOpenB}>
              <Card>
                <CardBody>
                  {Bhistory.length > 0 ? (
                    Bhistory.map((val, key) => {
                      return (
                        <div>
                          {val >= 0 ? (
                            <p className="historyPos">+ ${val}</p>
                          ) : (
                            <p className="historyNeg">- ${val * -1}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p>N/A</p>
                  )}
                </CardBody>
              </Card>
            </Collapse>
          </ReactStrap.Col>
        </ReactStrap.Row>
      </ReactStrap.Container>
    </div>
  );
}

export default App;
