"use client";

import { useEffect, useState } from "react"

type Todo = { desc: string, date: Date, done: boolean, doom: boolean };
type Warning = 0 | 1 | 2 | 3;

function parseDate(dateString: string): Date {
  const parts = dateString.split(' ');
  parts[0] = parts[0].replace(/\D+/g, '');
  const date = parts.join(' ');
  return new Date(date);
}

export default function Home() {
  const now = new Date();

  const storedNotes = localStorage.getItem('dontforget.notes') ?? '';

  const [notes, setNotes] = useState(storedNotes);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    localStorage.setItem('dontforget.notes', notes);

    const newTodos: Todo[] = [];

    const blocks = notes.split('\n\n');

    for (const block of blocks) {
      const lines = block.split('\n');
      const currentDate = parseDate(lines[0]);
      if (currentDate === null) {
        continue;
      }

      for (const line of lines) {
        if (line.startsWith('[ ] ')) {
          newTodos.push({ desc: line.substring(4), done: false, date: currentDate, doom: false });
        } else if (line.startsWith('[] ')) {
          newTodos.push({ desc: line.substring(3), done: false, date: currentDate, doom: false });
        }
        else if (line.startsWith('[x] ')) {
          newTodos.push({ desc: line.substring(4), done: true, date: currentDate, doom: false });
        }

        else if (line.startsWith('< > ')) {
          newTodos.push({ desc: line.substring(4), done: false, date: currentDate, doom: true });
        } else if (line.startsWith('<> ')) {
          newTodos.push({ desc: line.substring(3), done: false, date: currentDate, doom: true });
        }
        else if (line.startsWith('<x> ')) {
          newTodos.push({ desc: line.substring(4), done: true, date: currentDate, doom: true });
        }
      }
    }

    setTodos(newTodos);
  }, [notes])

  return (
    <div className="p-4 bg-gray-900 space-x-5 max-h-screen min-h-screen flex flex-row">
      <div className="shadow p-5 rounded-lg space-y-3 w-1/2 flex flex-col">
        <p className="text-lg font-medium" >Notes</p>
        <textarea
          className="resize-none outline-none font-mono text-sm border border-2 border-gray-800 rounded-lg bg-opacity-50 bg-gray-950 p-2.5 flex flex-col flex-grow"
          value={notes}
          onChange={e => setNotes(e.target.value)}>
        </textarea>
      </div>
      <div className="shadow bg-gray-900 p-5 rounded-lg space-y-3 w-1/2 flex flex-col">
        <p className="text-lg font-medium" >Todos</p>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} className="sr-only peer"/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show done</span>
        </label>
        <p className="overflow-auto whitespace-pre-wrap space-y-1 text-sm border border-2 border-gray-800 rounded-lg bg-gray-900 p-2.5 flex flex-col flex-grow">
          {todos.filter(a => {
            return showDone || !a.done;
          }).sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
          }).map((todo, index) => {
            const delta = todo.date.getTime() - now.getTime();
            let days = Math.ceil(delta * 1.15741e-8);
            const daysString = (() => {
              if (days < -1) {
                return Math.abs(days) + ' days ago';
              }
              if (days === -1) {
                return 'Yesterday';
              }
              if (days === 0) {
                return 'Today';
              }
              if (days === 1) {
                return 'Tomorrow';
              }
              return Math.abs(days) + ' days left';
            })();

            const warn: Warning = (() => {
              if (todo.done) {
                return 0;
              }
              if (todo.doom && days <= 3) {
                return Math.min(4 - days, 3) as Warning;
              }
              if (!todo.doom && days < 0) {
                return Math.min(-days, 3) as Warning;
              }
              return 0;
            })();

            const backgroundColour = (() => {
              switch (warn) {
                case 0:
                  return 'bg-gray-800';
                case 1:
                  return 'bg-yellow-500';
                case 2:
                  return 'bg-orange-500';
                case 3:
                  return 'bg-red-500';
              }
            })();

            return (<p className={`border border-black border-opacity-30 p-2 rounded ${todo.done ? 'opacity-30 line-through' : ''} ${backgroundColour}`} key={index}>{'[' + daysString + '] ' + todo.desc}</p>);
          })}
        </p>
      </div>
    </div>
  )
}
