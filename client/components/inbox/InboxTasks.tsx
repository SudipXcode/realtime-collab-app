import React from 'react'
import AddTask from '../inbox/AddInboxTask'
import PageHeading from '../ui/PageHeading'
import AllTasks from './AllTasks'

const InboxTasks = ({ initialData }) => {
    const flattenedTasks =
        initialData?.flatMap((list) =>
            list.tasks.map((task) => ({
                ...task,
                listId: list.id,
                listName: list.name,
            }))
        ) || [];
    return (
        <div className="w-full flex flex-col py-6 h-screen">
            <PageHeading title="Inbox" />
            <AddTask list={initialData} />
            <AllTasks tasks={flattenedTasks} />
        </div>
    )
}

export default InboxTasks
