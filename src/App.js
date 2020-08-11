import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    API.graphql(graphqlOperation(listNotes)).then(result => {
      setNotes(result.data.listNotes.items);
    });
  });

  function handleChangeNote(event) {
    setNote(event.target.value);
  }
  function hasExistingNote() {
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  }
  async function handleAddNote(event) {
    const input = { note };
    event.preventDefault();
    if (hasExistingNote()) {
      handleUpdateNote();
    } else {
      const result = await API.graphql(graphqlOperation(createNote, { input }));
      const newNote = result.data.createNote;
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setNote("");
    }
  }

  async function handleUpdateNote() {
    const input = {
      id,
      note
    };

    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updateNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updateNote,
      ...notes.slice(index + 1)
    ];

    setNotes(updatedNotes);
    setNote("");
    setId("");
  }
  async function handleItemDeleteClick(noteId) {
    const input = { id: noteId };
    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deletednote = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletednote);
    setNotes(updatedNotes);
  }

  function handleSetNote(item) {
    setNote(item.note);
    setId(item.id);
  }
  return (
    <div>
      <AmplifySignOut />
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-1">Amplify Notetaker</h1>
        <form onSubmit={handleAddNote} className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="write your note"
            onChange={handleChangeNote}
            value={note}
          />
          <button className="pa2 f4" type="submit">
            {id ? "Update Note" : "Add Note "}
          </button>
        </form>
        <div>
          {notes.map(item => (
            <div key={item.id} className="flex items-center">
              <li onClick={() => handleSetNote(item)} className="list pa1 f3">
                {item.note}
              </li>
              <button
                onClick={() => handleItemDeleteClick(item.id)}
                className="bg-transparent bn f4"
              >
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
