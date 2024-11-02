import React, { Component } from "react";
import { Modal } from "react-bootstrap";

export class ModalMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  handleShow() {
    this.setState({ showModal: true });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.message !== this.props.message && this.props.message) {
      this.handleShow();
    }
  }

  render() {
    const { showModal } = this.state;
    const { message } = this.props;

    return (
      <Modal show={showModal} onHide={this.handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{message.subject}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-8">
              <small className="text-uppercase text-muted" style={{ fontSize: "14px" }}>From</small>
              <h4>
                <a href={`mailto:${message.fromAddress}`} style={{ textDecoration: "none", fontSize: "18px" }}>
                  {message.name} ({message.fromAddress})
                </a>
              </h4>
            </div>
            <div className="col-sm-4">
              <small className="text-uppercase text-muted" style={{ fontSize: "14px" }}>Sent</small>
              <br />
              <h6>{message.dtSent}</h6>
            </div>
            <div className="col-sm-12">
              <p dangerouslySetInnerHTML={{ __html: message.body }} style={{ fontSize: "16px" }} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={this.handleClose}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ModalMessage;
