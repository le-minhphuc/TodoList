import React, { useState, useEffect } from 'react';

const Mainpage = () => {
    let [id, setId] = useState(1);
    let [todoList, setTodoList] = useState([]);
    let [todo, setTodo] = useState('');
    let [IdforDel, setIdforDel] = useState(-1);
    let [toUpdateContent, setToUpdateContent] = useState('');
    let [IdforUpdate, setIdforUpdate] = useState(-1);

    // get the initial state
    useEffect(() => {
        fetch('/initial', {
            method: 'GET',
        }).then(res => res.json())
        .then(jsonRes => {
            console.log(jsonRes);
            let newList = [];
            let maxId = 0;
            for (let item of jsonRes) {
                newList.push({todoId: item._id, todoContent: item.toAdd});
                maxId = Math.max(maxId, parseInt(item._id));
            }
            setId(maxId + 1);
            console.log(newList[0].todoId);
            setIdforDel(newList[0].todoId);
            setIdforUpdate(newList[0].todoId);
            setTodoList(newList);
        })
        .catch(err => console.log(err))
    }, []);

    const sendRequest = (sendMethod, sendBody) => {
        fetch('/', {
            method: sendMethod,
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(
                sendBody
            )
        }).then(res => res.text())
        .then(textRes => console.log(textRes))
        .catch(err => console.log(err));
    }

    const addHandler = (e) => {
        // send a post request to the server from here!
        e.preventDefault();
        if (todo === '') {
            alert("You forget to input sth!");
        } else {
            // let currentId = Math.floor(Math.random() * 100000);
            setId(id + 1); // increase the id
            let requestBody = { _id: id, toAdd: todo };
            sendRequest('POST', requestBody);
            setTodoList(currentTodo => [...currentTodo, {todoId: id, todoContent: todo}]);
            setIdforDel(id);
            setIdforUpdate(id);
            setTodo('');
        }
    };

    const updateHandler = (e) => {
        e.preventDefault();
        if (toUpdateContent === '') {
            alert("You forget update content!");
        } else {
            if (IdforUpdate === -1) {
                alert("You forget to choose an item to update!");
            } else {
                // do the update here!
                console.log(todoList[0].todoId);
                console.log(IdforUpdate);
                let itemToUpdate = todoList.find(singleTodo => singleTodo.todoId === parseInt(IdforUpdate));
                if (window.confirm(`You want to update "${itemToUpdate.todoContent}" with "${toUpdateContent}" ?`)) {
                    const newTodoList = todoList.map(singletodo => singletodo.todoId == IdforUpdate
                    ? {...singletodo, todoContent: toUpdateContent}
                    : singletodo);
                    // send a put request here
                    let requestBody = { itemToUpdateId: IdforUpdate, itemToUpdateContent: toUpdateContent };
                    sendRequest('PUT', requestBody);
                    setTodoList(newTodoList);
                    setIdforUpdate(-1);
                    setToUpdateContent('');
                }
            }
        }
    }

    const delHandler = (e) => {
        // send a delete request to the server
        e.preventDefault(); // Do not forget this!
        let content = '';
        for (let i = 0; i < todoList.length; i++) {
            if (todoList[i].todoId === parseInt(IdforDel)) {
                content = todoList[i].todoContent;
                break;
            }
        }
        if (content === '') {
            alert("Your list is empty");
        } else {
            if (content !== undefined && window.confirm(`Do you want to delete "${content}"`)) {
                setTodoList(todoList.filter(singleTodo => {
                    return singleTodo.todoId !== parseInt(IdforDel);
                }));
                let requestBody = { itemToDelete: IdforDel };
                sendRequest('DELETE', requestBody);
                setIdforDel(-1);
            }
        } 
    };

    const delWholeHandler = () => {
        // send a delete request to the server
        if (todoList.length > 0) {
            if (window.confirm("Do you want to delete the whole list?")) {
                setTodoList([]);
                // send a delete request
                setIdforDel(-1);
                let requestBody = { itemToDelete: "Whole list"};
                sendRequest('DELETE', requestBody);
            }
        } else {
            alert("The list is already empty");
        }
    };

    return (
        <div className="mainpage-container" id="mainpage-container-id">
            <div>YOUR TO DO LIST</div>
            { todoList.length !== 0 && todoList[0].todoContent !== undefined
                ? todoList.map(singleTodo => {
                return (
                    <div>{singleTodo.todoContent}</div>
                )})
                : <div>Nothing yet!</div>
            }
            <form className="add-item-container" onSubmit={addHandler}>
                <label>To add item
                    <input type="text" placeholder="Add your todo" value={todo} 
                        onChange={e => setTodo(e.target.value)} />
                    <input type="submit" value="ADD"/>
                </label>
            </form>

            <form onSubmit={updateHandler}>
                <label>To update item
                    <select value={IdforUpdate} onChange={e => setIdforUpdate(e.target.value)}>
                        <option value='0' disabled>Select an item</option>
                        {todoList.map(singleTodo => {
                            return (
                                <option value={singleTodo.todoId}>{singleTodo.todoContent}</option>
                            )
                        })}
                    </select>
                    <input type="text" placeholder="Change item to" value={toUpdateContent} 
                        onChange={e => setToUpdateContent(e.target.value)}/>
                    <input type="submit" value="UPDATE" />
                </label>
            </form>

            <form className="delete-item-container" onSubmit={delHandler}>
                <label>To delete items
                    <select value={IdforDel} onChange={e => setIdforDel(e.target.value)}>
                        <option value='0' disabled>Select an item</option>
                        {todoList.map(singleTodo => {
                            return (
                                <option value={singleTodo.todoId}>{singleTodo.todoContent}</option>
                            )
                        })}
                    </select>
                    <input type="submit" value="DELETE ITEM"/>
                </label>
            </form>

            <form className="delete-entire-list" onSubmit={delWholeHandler}>
                <label>To delete entire list
                    <input type="submit" value="DELETE WHOLE LIST" />
                </label> 
            </form>
        </div>
    )
};

export default Mainpage;