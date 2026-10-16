namespace Trilho.Application.UseCases.Dashboard.Shared;
/// <summary>
/// Sprints derivados por data (não há entidade Sprint): janelas consecutivas de N dias a partir de uma data âncora.
/// </summary>
public static class SprintCalendar
{
    public static int IndexOf(DateOnly date, DateOnly anchor, int lengthDays)
    {
        var days = date.DayNumber - anchor.DayNumber;

        // Divisão inteira com piso, para datas anteriores à âncora.
        return days >= 0 ? days / lengthDays : -((-days + lengthDays - 1) / lengthDays);
    }

    public static (DateOnly Start, DateOnly End) RangeOf(int index, DateOnly anchor, int lengthDays)
    {
        var start = anchor.AddDays(index * lengthDays);

        return (start, start.AddDays(lengthDays - 1));
    }

    public static string LabelOf(int index) => $"S{index + 1}";
}
