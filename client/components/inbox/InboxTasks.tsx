import React from 'react'
import AddTask from '../lists/AddTask'
import PageHeading from '../ui/PageHeading'
import AllTasks from './AllTasks'

const InboxTasks = () => {
    const list = []
    return (
        <div className="w-full flex flex-col py-6 h-screen">
            <PageHeading title="Inbox" />
            <AddTask list={list} />
            <AllTasks />
        </div>
    )
}

export default InboxTasks
