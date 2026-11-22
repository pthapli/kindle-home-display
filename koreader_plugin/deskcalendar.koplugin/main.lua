local Dispatcher = require("dispatcher")
local Event = require("ui/event")
local InfoMessage = require("ui/widget/infomessage")
local TextViewer = require("ui/widget/textviewer")
local UIManager = require("ui/uimanager")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local _ = require("gettext")

local DeskCalendar = WidgetContainer:extend{
    name = "deskcalendar",
    is_doc_only = false,
}

-- Auto-refresh interval: 2 minutes (120 seconds) for testing
local REFRESH_INTERVAL = 120

function DeskCalendar:onDispatcherRegisterActions()
    Dispatcher:registerAction("show_desk_calendar", {
        category = "none",
        event = "ShowDeskCalendar",
        title = _("Desk Calendar (Meetings)"),
        general = true,
    })
end

function DeskCalendar:init()
    self:onDispatcherRegisterActions()
    self.ui.menu:registerToMainMenu(self)

    -- Keep Kindle screen awake on your desk
    os.execute("lipc-set-prop com.lab126.powerd preventScreenSaver 1")

    -- Schedule background sync for REFRESH_INTERVAL (120 seconds)
    UIManager:scheduleIn(REFRESH_INTERVAL, function()
        self:syncAndReload()
    end)
end

function DeskCalendar:syncAndReload()
    -- Ensure Wi-Fi is active
    os.execute("lipc-set-prop com.lab126.cmd wirelessEnable 1")

    -- Fetch rich HTML schedule
    local cmd = "curl -s --connect-timeout 8 -m 10 -L 'https://tinyurl.com/pthapli' -o /tmp/fresh_cal.html"
    os.execute(cmd)

    -- If valid file received, update both HTML and TXT files
    if os.execute("[ -s /tmp/fresh_cal.html ]") == 0 then
        os.execute("cp /tmp/fresh_cal.html /mnt/us/0_Live_Meetings.html && cp /tmp/fresh_cal.html /mnt/us/documents/0_Live_Meetings.html")

        -- Seamlessly reload open document (works on both .html and .txt)
        if self.ui and self.ui.document and self.ui.document.file then
            local current_file = tostring(self.ui.document.file)
            if current_file:find("0_Live_Meetings") or current_file:find("Live_Meetings") then
                UIManager:nextTick(function()
                    self.ui:handleEvent(Event:new("Reload"))
                end)
            end
        end
    else
        -- If fetch failed (e.g. Wi-Fi reconnecting), retry in 30 seconds
        UIManager:scheduleIn(30, function()
            self:syncAndReload()
        end)
    end
end

function DeskCalendar:addToMainMenu(menu_items)
    local item = {
        text = _("📅 Desk Calendar (Live Meetings)"),
        keep_menu_open = true,
        callback = function()
            self:fetchAndDisplay()
        end,
    }
    menu_items.desk_calendar = item

    if menu_items.more_tools and menu_items.more_tools.sub_item_table then
        table.insert(menu_items.more_tools.sub_item_table, 1, item)
    end
end

function DeskCalendar:onShowDeskCalendar()
    self:fetchAndDisplay()
end

function DeskCalendar:fetchAndDisplay()
    local popup = InfoMessage:new{
        text = _("Fetching live meetings from Google Cloud..."),
        timeout = 2,
    }
    UIManager:show(popup)

    UIManager:nextTick(function()
        local handle = io.popen("curl -s --connect-timeout 8 -m 10 -L 'https://tinyurl.com/pthapli'")
        local result = ""
        if handle then
            result = handle:read("*a")
            handle:close()
        end

        if not result or result == "" then
            result = "Could not reach calendar. Please ensure Wi-Fi is connected on your Kindle."
        else
            local f = io.open("/mnt/us/0_Live_Meetings.html", "w")
            if f then
                f:write(result)
                f:close()
            end
        end

        local viewer = TextViewer:new{
            title = _("Weekly Schedule (Google Calendar)"),
            text = result,
            title_multilines = false,
        }
        UIManager:show(viewer)
    end)
end

return DeskCalendar
