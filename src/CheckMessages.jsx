import React, { Component } from "react";
import { InboxHtml } from "./InboxHTML";
import ModalMessage from "./ModalMessage";
import axios from "axios";

export class CheckMessages extends Component {
  constructor(props) {
    super(props);
    this.markRead = this.markRead.bind(this);
    this.doShow = this.doShow.bind(this);
    this.doCompose = this.doCompose.bind(this);
    this.toggleMark = this.toggleMark.bind(this);
    this.toggleMarkAll = this.toggleMarkAll.bind(this);
    this.deleteMarked = this.deleteMarked.bind(this);
    this.refreshMessages = this.refreshMessages.bind(this);
    this.deleteMessages = this.deleteMessages.bind(this);
    this.ModalMessage = React.createRef();
    this.ModalCompose = React.createRef();
    this.state = {
      initMessages: [],
      messages: [],
      selected: {},
      deleted: [],
      extraSpace: 0,
    };
  }

  async markRead(idx) {
    const messageId = this.state.messages[idx].id;
    try {
      await axios.post(`http://localhost:8000/api/mark-message-read/${messageId}`);
      let messages = [...this.state.messages];
      messages[idx].read = true;
      this.setState({ messages });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async doShow(messageId) {
    const messageIndex = this.state.messages.findIndex((message) => message.id === messageId);
    if (messageIndex !== -1) {
      await this.markRead(messageIndex);
      this.setState({ selected: this.state.messages[messageIndex] });
      // Open message in modal
      if (this.ModalMessage.current) {
        this.ModalMessage.current.handleShow();
      }
    }
  }  

  doCompose() {
    if (this.ModalCompose.current) {
      this.ModalCompose.current.handleShow();
    }
  }

  toggleMark(messageId) {
    const messageIndex = this.state.messages.findIndex((message) => message.id === messageId);
    if (messageIndex !== -1) {
      let messages = [...this.state.messages];
      messages[messageIndex].marked = messages[messageIndex].marked ? 0 : 1;
      this.setState({ messages });
    }
  }
  
  async doDelete(idx) {
    const messageId = this.state.messages[idx].id;
    try {
      await axios.delete(`http://localhost:8000/api/messages/${messageId}`);
      const messages = [...this.state.messages];
      messages.splice(idx, 1);
      this.setState({ messages });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  toggleMarkAll() {
    let messages = [...this.state.messages];
    messages.forEach((message) => {
      message.marked = message.marked ? 0 : 1;
    });
    this.setState({ messages });
  }

  deleteMarked() {
    // Filter out messages that are marked for deletion
    const remainingMessages = this.state.messages.filter(message => message.marked !== 1);
  
    // Update the state with the remaining messages
    this.setState({ messages: remainingMessages });
  
    // Optionally, send a request to delete marked messages from the server
    // if you need to keep the server and client state in sync
    const deletePromises = this.state.messages
      .filter(message => message.marked === 1)
      .map(message => axios.delete(`http://localhost:8000/api/messages/${message.id}`));
  
    Promise.all(deletePromises)
      .then(() => {
        // Refresh messages after deletion
        this.refreshMessages();
      })
      .catch(error => {
        console.error("Error deleting marked messages:", error);
      });
  }
  

  async refreshMessages() {
    try {
      const response = await axios.get("http://localhost:8000/api/messages");
      const messages = response.data.messages;
      messages.forEach((message) => {
        message.read = message.read === 1;
      });
      this.setState({ messages });
    } catch (error) {
      console.error("Error refreshing messages:", error);
    }
  }  

  deleteMessages(arr) {
    let messages = [...this.state.messages];
    let deleted = [...this.state.deleted];
    for (var i = arr.length - 1; i >= 0; i--) {
      deleted.push(messages[arr[i]]);
      messages.splice(arr[i], 1);
    }
    this.setState({ messages, deleted });
  }

  async componentDidMount() {
    try {
      const response = await axios.get('http://localhost:8000/api/messages');
      const { messages } = response.data;
      if (Array.isArray(messages)) {
        this.setState({ messages });
      } else {
        console.error("Messages is not an array:", messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  render() {
    return (
      <div>
        <InboxHtml parent={this} />
        <ModalMessage ref={this.ModalMessage} message={this.state.selected} />
      </div>
    );
  }
}

export default CheckMessages;
