import React, { useEffect, useState } from "react";

export const InboxHtml = ({ parent }) => {
  const sortedMessages = [...(parent.state.messages || [])].sort(
    (a, b) => b.id - a.id
  );

  const [issmol, setIssmol] = useState(window.innerWidth <= 420);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleResize = () => {
    setIssmol(window.innerWidth <= 420);
  };

  useEffect(() => {
    // Add a window resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const smoltext = (item) => {
    if (issmol) {
      return null;
    } else {
      return `(${item.fromAddress})`;
    }
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDeleteMarked = () => {
    parent.deleteMarked();
    // Uncheck the mark checkbox input
    document.getElementById("checkAll").checked = false;
    setDropdownOpen(false); // Close dropdown after action
  };

  // Render some text if there are no messages
  if (sortedMessages && sortedMessages.length === 0) {
    return (
      <div>
        <main className="px-2 flex-fill">
          <div>
            <div className="col-12 px-4 d-flex flex-column">
              <div className="row">
                <div className="col-md py-3 tab-content">
                  <div id="messages" className="tab-pane active"></div>
                  <div className="d-flex flex-sm-row flex-column py-1 mb-1">
                    <button
                      type="button"
                      className="btn btn-outline-secondary mx-sm-1 mx-none"
                      onClick={parent.refreshMessages}
                    >
                      <i className="align-middle icon-refresh fas fa-sync" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <center>
          <h2>Inbox is Empty!</h2>
        </center>
      </div>
    );
  }

  return (
    <main className="px-2 flex-fill">
      <div>
        <div className="col-12 px-4 d-flex flex-column">
          <div className="row">
            <div className="col-md py-3 tab-content">
              <div id="messages" className="tab-pane active">
                <div className="d-flex flex-sm-row flex-column py-1 mb-1">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary text-uppercase"
                    >
                      <div
                        className="custom-control custom-checkbox"
                        onClick={parent.toggleMarkAll}
                      >
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="checkAll"
                          defaultChecked={false}
                          onChange={parent.toggleMarkAll}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="checkAll"
                        >
                          Mark
                        </label>
                      </div>
                    </button>
                    {parent.state.messages &&
                    parent.state.messages.filter((v) => v.marked === 1).length > 0 ? (
                      <div className="btn-group mr-sm-auto mr-none">
                        <button
                          type="button"
                          className="btn btn-outline-secondary text-uppercase"
                          onClick={handleDropdownToggle}
                        >
                          ▼
                        </button>
                        {dropdownOpen && (
                          <div className="dropdown-menu show" style={{position: "absolute",bottom:"-52px"}}>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={handleDeleteMarked}
                            >
                              Delete marked items
                            </a>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary mx-sm-1 mx-none"
                    onClick={parent.refreshMessages}
                  >
                    <i className="align-middle icon-refresh fas fa-sync" />
                  </button>
                </div>
                {/* message list */}
                <ul className="list-group py-2">
                  {sortedMessages && sortedMessages.length > 0
                    ? sortedMessages.map((item, idx) => (
                        <li
                          key={idx}
                          className="list-group-item list-group-item-action d-block py-1"
                          style={{
                            backgroundColor: item.read ? "#ececec" : "#fafafa",
                            fontWeight: item.read ? "normal" : "bold",
                          }}
                        >
                          <summary className="row">
                            <div className="col py-2 order-1">
                              <div
                                onClick={() => parent.toggleMark(item.id)}
                                className="custom-control custom-checkbox"
                              >
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  name={"check" + idx}
                                  checked={item.marked === 1}
                                  onChange={() => parent.toggleMark(item.id)}
                                />
                                <label
                                  className="custom-control-label text-nowrap"
                                  htmlFor={"check" + idx}
                                >
                                  <a
                                    title="send mail"
                                    href={"mailto:" + item.fromAddress}
                                    style={{
                                      "fontSize": "15px",
                                      fontWeight: item.read ? "normal" : "bold",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {item.name} {smoltext(item)}
                                  </a>
                                </label>
                              </div>
                            </div>
                            <div className="col-auto px-0 order-last order-sm-2 d-none d-sm-block align-self-center text-right">
                              <a
                                className="text-secondary px-md-1"
                                title="Delete"
                                onClick={() => parent.doDelete(idx)}
                              >
                                <span className="icon icon-trash fa fa-fw fa-trash" />
                              </a>
                            </div>
                            <div
                              className="col-sm-12 col-10 py-2 order-3"
                              onClick={() => parent.doShow(item.id)}
                            >
                              <div className="float-right text-right">
                                <span
                                  className={
                                    " d-none d-sm-block " +
                                    (!item.read ? "font-weight-bold" : "")
                                  }
                                >
                                  {item.dtSent}
                                </span>
                              </div>
                              <p className="lead mb-0">
                                <a
                                  title={
                                    !item.read
                                      ? "This is a new message"
                                      : "View this message"
                                  }
                                  onClick={() => parent.doShow(item.id)}
                                >
                                  {item.subject}
                                </a>
                                {item.attachment ? (
                                  <i className="align-middle fa fa-paperclip icon-paper-clip" />
                                ) : null}
                                &nbsp;&nbsp;
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm ml-2 d-none d-md-inline"
                                  onClick={() => parent.doShow(item.id)}
                                >
                                  Open
                                </button>
                              </p>
                            </div>
                          </summary>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default InboxHtml;
