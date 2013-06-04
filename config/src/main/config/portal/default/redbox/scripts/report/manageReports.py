from java.lang import String
from java.util import ArrayList

class ManageReportsData:

    def __init__(self):
        pass
    def __activate__(self, context):
        self.auth = context["page"].authentication
        self.errorMsg = "" 
        self.request = context["request"]
        self.response = context["response"]
        self.formData = context["formData"]
        self.log = context["log"]
        self.reportManager = context["Services"].getService("reportManager")
        
        if (self.auth.is_logged_in()):
            if (self.auth.is_admin()==True):
                pass
            else:
                self.errorMsg = "Requires Admin / Librarian / Reviewer access."
        else:
            self.errorMsg = "Please login."
            
        if self.errorMsg == "":             
            self.func = self.formData.get("func", "")
            if self.func == "" and self.request.getParameter("func"):
                self.func = self.request.getParameter("func")         
            if self.func == "action":
                self.action = self.request.getParameter("action")
                if self.action == "delete":
                    self.deleteReport()
                    out = self.response.getPrintWriter("text/plain; charset=UTF-8")
                    out.println("{\"status\":\"OK\"}")
                    out.close()
                if self.action == "duplicate":
                    self.duplicateReport()
                    out = self.response.getPrintWriter("text/plain; charset=UTF-8")
                    out.println("{\"status\":\"OK\"}")
                    out.close()    
                    
    def duplicateReport(self):
        reportNames = self.formData.get("reportName").split(",")
        if len(reportNames) > 1:
            for reportName in reportNames:       
                self.reportManager.duplicateReport(reportName)
        else:
            self.reportManager.duplicateReport(self.formData.get("reportName"))
                    
    def deleteReport(self):
        reportNames = self.formData.get("reportName").split(",")
        if len(reportNames) > 1:
            for reportName in reportNames:        
                self.reportManager.deleteReport(reportName)
        else:
            self.reportManager.deleteReport(self.formData.get("reportName"))
            
    def getErrorMsg(self):
        return self.errorMsg
            
    def buildDashboard(self, context):
        self.velocityContext = context
    
    def getReports(self):
        if (self.reportManager is not None):
            return self.reportManager.getReports()
    
    def getRedboxReports(self):
        if (self.reportManager is not None):
            reports = self.reportManager.getReports()
            redboxReports = ArrayList()
            for report in reports.values():
                if String(report.getConfig().getString(None, "report", "className")).endsWith("RedboxReport"):
                    redboxReports.add(report)
            return redboxReports    
    
    def getStatisticalReports(self):
        if (self.reportManager is not None):
            reports = self.reportManager.getReports()
            redboxReports = ArrayList()
            for report in reports.values():
                if String(report.getConfig().getString(None, "report", "className")).endsWith("StatisticalReport"):
                    redboxReports.add(report)
            return redboxReports    
    
    
    def getReportRunLink(self, report):
        classname = String(report.getConfig().getString(None, "report", "className"))
        if classname.endsWith("RedboxReport"):
            return "reportResult?id=%s" % report.getReportName()
        else:
            return  "statisticalReports?reportName=%s" % report.getReportName()
        
    def getReportEditLink(self, report):
        classname = String(report.getConfig().getString(None, "report", "className"))
        if classname.endsWith("RedboxReport"):
            return "reports?reportName=%s" % report.getReportName()
        else:
            return  "statisticalReports?reportName=%s" % report.getReportName()
        