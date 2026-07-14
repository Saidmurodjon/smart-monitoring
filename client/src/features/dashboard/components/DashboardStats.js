function DashboardStats({title, icon, value, description, colorIndex, overlay}){

    const COLORS = ["primary", "primary"]

    const getDescStyle = () => {
        if(description.includes("↗︎"))return "font-bold text-green-700 dark:text-green-300"
        else if(description.includes("↙"))return "font-bold text-rose-500 dark:text-red-400"
        else return ""
    }

    if (overlay) {
        return (
            <div className="stats bg-base-100/80 backdrop-blur shadow-lg w-full overflow-hidden">
                <div className="stat px-3 py-2.5 flex flex-row items-center justify-between gap-2 overflow-hidden">
                    <div className="min-w-0 overflow-hidden">
                        <div className="stat-title text-xs leading-tight truncate dark:text-slate-300">{title}</div>
                        <div className={`stat-value text-xl leading-tight dark:text-slate-300 text-${COLORS[colorIndex%2]}`}>{value}</div>
                    </div>
                    <div className={`shrink-0 dark:text-slate-300 text-${COLORS[colorIndex%2]} w-6 h-6`}>{icon}</div>
                </div>
            </div>
        )
    }

    return(
        <div className="stats bg-base-100 shadow w-full">
            <div className="stat px-4 py-3 flex flex-row items-center justify-between">
                <div>
                    <div className="stat-title text-xs dark:text-slate-300">{title}</div>
                    <div className={`stat-value text-2xl dark:text-slate-300 text-${COLORS[colorIndex%2]}`}>{value}</div>
                    <div className={"stat-desc text-xs " + getDescStyle()}>{description}</div>
                </div>
                <div className={`stat-figure dark:text-slate-300 text-${COLORS[colorIndex%2]} w-6 h-6`}>{icon}</div>
            </div>
        </div>
    )
}

export default DashboardStats