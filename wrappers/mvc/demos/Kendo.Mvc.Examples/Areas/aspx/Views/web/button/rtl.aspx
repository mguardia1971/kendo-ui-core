﻿<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">

<div class="k-rtl">

<p>

<%= Html.Kendo().Button()
    .Name("textButton")
    .Content("Text button") %>

<%= Html.Kendo().Button()
    .Name("iconTextButton")
    .SpriteCssClass("k-icon k-i-ungroup")
    .Content("Icon and text") %>

<%= Html.Kendo().Button()
    .Name("iconButton")
    .SpriteCssClass("k-icon k-i-refresh")
    .Content("<span class='k-sprite'>Refresh</span>") %>

<%= Html.Kendo().Button()
    .Name("disabledButton")
    .Enable(false)
    .Content("Disabled button") %>

</p>

</div>

</asp:Content>