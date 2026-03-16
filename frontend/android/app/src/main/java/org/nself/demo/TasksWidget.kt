package org.nself.demo

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONArray

class TasksWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.tasks_widget)

            // Load tasks from SharedPreferences (written by the main app)
            val prefs = context.getSharedPreferences("ntasks_widget", Context.MODE_PRIVATE)
            val tasksJson = prefs.getString("widget_tasks", "[]") ?: "[]"

            val tasksArray = try { JSONArray(tasksJson) } catch (e: Exception) { JSONArray() }
            val incompleteCount = (0 until tasksArray.length()).count { i ->
                !tasksArray.getJSONObject(i).optBoolean("completed", false)
            }
            views.setTextViewText(R.id.widget_task_count, "$incompleteCount remaining")

            // Launch app on container click
            val launchIntent = context.packageManager
                .getLaunchIntentForPackage(context.packageName)
                ?.apply { action = Intent.ACTION_MAIN }

            val pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // New task button -- deep link
            val newTaskIntent = Intent(Intent.ACTION_VIEW).apply {
                data = android.net.Uri.parse("ntasks://new-task")
                `package` = context.packageName
            }
            val newTaskPending = PendingIntent.getActivity(
                context, 1, newTaskIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_add_button, newTaskPending)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
