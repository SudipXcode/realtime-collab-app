import React from 'react'
import AddTask from '../inbox/AddInboxTask'
import PageHeading from '../ui/PageHeading'
import AllTasks from './AllTasks'

const InboxTasks = ({ initialData }: { initialData: any[] }) => {
    const flattenedTasks =
        initialData?.flatMap((list: any) =>
            list.tasks.map((task: any) => ({
                ...task,
                listId: list.id,
                listName: list.name,
            }))
        ) || [];
    return (
        <div className="w-full flex flex-col py-6 h-screen">
            <PageHeading title="Inbox" />
            <AddTask list={initialData} />
            <AllTasks initialTasks={flattenedTasks} />
        </div>
    )
}

export default InboxTasks
